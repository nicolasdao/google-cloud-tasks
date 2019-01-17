const { fetch, promise: { delay, addTimeout } } = require('../utils')

// doc: https://cloud.google.com/tasks/docs/reference/rest/
const APP_ENG_PUSH_TASK_URL = (projectId, locationId, queueName) => `https://cloudtasks.googleapis.com/v2beta3/projects/${projectId}/locations/${locationId}/queues/${queueName}/tasks`

const _validateRequiredParams = (params={}) => Object.keys(params).forEach(p => {
	if (!params[p])
		throw new Error(`Parameter '${p}' is required.`)
})

/**
 * Returns up to 30,000 tasks
 * BEWARE: Google Cloud Task quotas for listing tasks is 10 requests per seconds (https://cloud.google.com/tasks/docs/quotas) 
 * 
 * @param  {String}   projectId  			[description]
 * @param  {String}   locationId 			[description]
 * @param  {String}   queueName  			[description]
 * @param  {String}   token      			[description]
 * @param  {String}   options.pageToken   	[description]
 * @param  {Number}   options.page   		[description]
 * @param  {Function} options.some   		[description]
 * @param  {Function} options.filter   		[description]
 * @return {[type]}                     	[description]
 */
const listTasks = ({ projectId, locationId, queueName, token }, options={}) => Promise.resolve(null).then(() => {
	const taskUri = `${APP_ENG_PUSH_TASK_URL(projectId, locationId, queueName)}?pageSize=1000${options.pageToken ? `&pageToken=${options.pageToken}` : ''}`
	return fetch.get(taskUri, {
		Accept: 'application/json',
		Authorization: `Bearer ${token}`
	}).then((res={}) => {
		const page = options.page || 0
		const filter = options.filter && typeof(options.filter) == 'function' ? options.filter : null
		const pageToken = (res.data || {}).nextPageToken
		const tasks = ((res.data || {}).tasks || []).map(({ name, appEngineHttpRequest, scheduleTime, createTime }) => {
			const id = (name || '').split('/').slice(-1)[0]
			const method = ((appEngineHttpRequest || {}).httpMethod || 'GET').toUpperCase()
			const pathname = (appEngineHttpRequest || {}).relativeUri || '/'
			return {
				id,
				method,
				pathname,
				schedule: scheduleTime,
				created: createTime
			}
		})

		if (page > 30 || !pageToken || tasks.length < 1000)
			return tasks.filter(t => filter ? filter(t) : true)

		return listTasks({ projectId, locationId, queueName, token }, { pageToken, page: page+1, filter })
			.then(data => {
				tasks.push(...data)
				return tasks.filter(t => filter ? filter(t) : true)
			})
	}) 
})

/**
 * Scan up to 30,000 tasks to find a specific one
 * BEWARE: Google Cloud Task quotas for listing tasks is 10 requests per seconds (https://cloud.google.com/tasks/docs/quotas) 
 * 
 * @param  {String}   projectId  			[description]
 * @param  {String}   locationId 			[description]
 * @param  {String}   queueName  			[description]
 * @param  {String}   token      			[description]
 * @param  {String}   options.pageToken   	[description]
 * @param  {Number}   options.page   		[description]
 * @param  {Function} options.find   		[description]
 * @param  {Function} options.filter   		[description]
 * @return {[type]}                     	[description]
 */
const findTask = ({ projectId, locationId, queueName, token, find }, options={}) => Promise.resolve(null).then(() => {
	const taskUri = `${APP_ENG_PUSH_TASK_URL(projectId, locationId, queueName)}?pageSize=1000${options.pageToken ? `&pageToken=${options.pageToken}` : ''}`
	return fetch.get(taskUri, {
		Accept: 'application/json',
		Authorization: `Bearer ${token}`
	}).then((res={}) => {
		const page = options.page || 0
		const filter = options.filter && typeof(options.filter) == 'function' ? options.filter : null
		const pageToken = (res.data || {}).nextPageToken
		const tasks = ((res.data || {}).tasks || []).map(({ name, appEngineHttpRequest, scheduleTime, createTime }) => {
			const id = (name || '').split('/').slice(-1)[0]
			const method = ((appEngineHttpRequest || {}).httpMethod || 'GET').toUpperCase()
			const pathname = (appEngineHttpRequest || {}).relativeUri || '/'
			return {
				id,
				method,
				pathname,
				schedule: scheduleTime,
				created: createTime
			}
		})

		const matchedTask = tasks.find(find)

		if (matchedTask)
			return matchedTask

		if (page > 30 || !pageToken || tasks.length < 1000)
			return null

		return findTask({ projectId, locationId, queueName, token, find }, { pageToken, page: page+1, filter })
	}) 
})

const pushTask = ({ projectId, locationId, queueName, token, method, pathname, headers, body, id, schedule, serviceUrl }) => Promise.resolve(null).then(() => {
	_validateRequiredParams({ projectId, locationId, queueName, token, method })
	const m = method.toUpperCase()
	const pname = `/${(pathname || '').replace(/^\//, '')}`
	const service = serviceUrl ? `${serviceUrl.replace(/\/$/, '')}${pname}` : null
	let request = {
		headers,
		httpMethod: m,
		relativeUri: pname
	}
	if (m != 'GET' && body)
		request.body = Buffer.from(JSON.stringify(body)).toString('base64')

	let payload = {
		task: { 
			appEngineHttpRequest: request 
		},
		responseView: 'FULL'
	}

	if (id)
		payload.task.name = `projects/${projectId}/locations/${locationId}/queues/${queueName}/tasks/${id}`
	if (schedule)
		payload.task.scheduleTime = schedule

	if (service) {
		const devSchedule = schedule 
			? new Date(schedule).getTime() - Date.now()
			: -10

		const _pushTask = () => (m == 'GET' ? fetch.get : fetch.post)(
			service,
			{
				Accept: 'application/json',
				Authorization: `Bearer ${token}`
			},
			JSON.stringify(body||{}))

		return delay(devSchedule > 0 ? devSchedule : [100, 1000])	
			.then(() => addTimeout(_pushTask(), 4000)
				.catch(err => {
					if (err && (err.message || '').indexOf('timeout') >= 0)
						return { status: 200, data: null }
					else
						throw err
				}))
			.then(res => {
				res.request = { method: m, uri: service }
				return res
			})
	} else {
		const taskUri = APP_ENG_PUSH_TASK_URL(projectId, locationId, queueName)
		return fetch.post(taskUri, {
			Accept: 'application/json',
			Authorization: `Bearer ${token}`
		}, JSON.stringify(payload)).then(res => {
			res.request = { method: 'POST', uri: taskUri }
			return res
		})
	}
})


module.exports = {
	pushTask,
	listTasks,
	findTask
}




