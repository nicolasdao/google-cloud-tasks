/**
 * Copyright (c) 2018, Neap Pty Ltd.
 * All rights reserved.
 * 
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const googleAuth = require('google-auto-auth')
const { promise: { retry }, collection, obj: { merge }, validate } = require('./utils')
const { pushTask, listTasks, findTask } = require('./src/gcp')

const ERR_INVALID_SCHEDULE_CODE = 589195462987

const getToken = auth => new Promise((onSuccess, onFailure) => auth.getToken((err, token) => err ? onFailure(err) : onSuccess(token)))

const _validateRequiredParams = (params={}) => Object.keys(params).forEach(p => {
	if (!params[p])
		throw new Error(`Parameter '${p}' is required.`)
})

const _retryFn = (fn, options={}) => retry(
	fn, 
	() => true, 
	err => {
		const throwErrorNow = err && err.message && err.message.toLowerCase().indexOf('lacks iam permission') >= 0
		return !throwErrorNow
	},
	{ ignoreFailure: true, retryInterval: [500, 2000], timeOut: options.timeout || 10000 })


const _getJsonKey = jsonKeyFile => require(jsonKeyFile)

const HTTP_METHODS = { 'GET': true, 'POST': true, 'PUT': true, 'DELETE': true, 'PATCH': true, 'OPTIONS': true, 'HEAD': true }
const createClient = ({ name, method, pathname, headers={}, jsonKeyFile, mockFn, byPassConfig={} }) => {
	const { service:serviceUrl } = byPassConfig
	if (serviceUrl && !validate.url(serviceUrl))
		throw new Error(`Invalid argument exception. 'byPassConfig.service' ${serviceUrl} is an invalid URL.`)

	const { getJsonKey: _mockGetJsonKey, pushTask: _mockPushTask, getToken: _mockGetToken } = mockFn || {}
	const getTheToken = serviceUrl ? (() => Promise.resolve('dev-token-1234')) : (_mockGetToken || getToken)
	const pushTheTask = _mockPushTask || pushTask

	const queue = name
	_validateRequiredParams({ queue, jsonKeyFile })
	method = (method || 'GET').trim().toUpperCase() 
	pathname = pathname || '/'
	
	if (!HTTP_METHODS[method])
		throw new Error(`Invalid argument exception. Method '${method}' is not a valid HTTP method.`)

	const { location_id, project_id } = (_mockGetJsonKey || _getJsonKey)(jsonKeyFile)
	
	if (!project_id)
		throw new Error(`Missing required 'project_id' property. This property should be present inside the service account json file ${jsonKeyFile}.`)
	if (!location_id)
		throw new Error(`Missing required 'location_id' property. This property should be present inside the service account json file ${jsonKeyFile}. It contains the location where the Google Cloud Task Queue is hosted.`)
	
	const auth = googleAuth({ 
		keyFilename: jsonKeyFile,
		scopes: ['https://www.googleapis.com/auth/cloud-platform']
	})

	const push = (taskData, options={}) => Promise.resolve(null).then(() => { 
		const { id, method:_method, schedule, pathname:_pathname, headers:_header={}, body={} } = taskData
		const h = merge(headers, _header)
		let s
		if (schedule) {
			const scheduleType = typeof(schedule)
			if (schedule instanceof Date)
				s = schedule.toISOString()
			else if (scheduleType == 'string') {
				const d = new Date(schedule)
				if (d.toString().toLowerCase() == 'invalid date') {
					let e = new Error(`Invalid argument exception. 'schedule' ${schedule} is an invalid date`)
					e.code = ERR_INVALID_SCHEDULE_CODE
					throw e
				}
				s = d.toISOString()
			} else if (scheduleType == 'number') {
				const ref = Date.now() + 5000
				const n = ref > schedule ? ref : schedule
				const d = new Date(n)
				if (d.toString().toLowerCase() == 'invalid date') {
					let e = new Error(`Invalid argument exception. 'schedule' ${schedule} is an invalid date`)
					e.code = ERR_INVALID_SCHEDULE_CODE
					throw e
				}
				s = d.toISOString()
			} else {
				let e = new Error(`Invalid argument exception. 'schedule' ${schedule} is an invalid date`)
				e.code = ERR_INVALID_SCHEDULE_CODE
				throw e
			}
		}
		return getTheToken(auth)
			.then(token => _retryFn(
				() => pushTheTask({
					id,
					schedule: s,
					projectId: project_id, 
					locationId: location_id, 
					queueName: queue, 
					token, 
					method: _method || method,
					pathname: _pathname || pathname, 
					headers: h,
					body,
					serviceUrl
				}),
				options))
	})
		.catch(e => {
			if (options.retryCatch)
				return options.retryCatch(e)
			else
				throw e
		})
		.then(({ status, data, request }) => {
			if (status >= 200 && status < 300)
				return data
			else {
				let message = request && request.method && request.uri 
					? `Pushing task to queue '${name}' using an HTTP ${request.method} to ${request.uri} failed with HTTP code ${status}`
					: `Pushing task to queue '${name}' failed with HTTP code ${status}`

				if (data && data.error && data.error.message)
					message = `${message}\nDetails: ${data.error.message}`
			
				let e = new Error(message)
				e.data = data || {}
				e.status = status // 409 means that a task with the ID already exists
				throw e
			}
		})

	const service = {
		/**
		 * [description]
		 * @param  {Object}  taskData 					Task payload
		 * @param  {Number}  options.retryCatch 		If specified, this function will deal with managing exception in case
		 *                                        		the retry attempts all fail. If this option is not specified,  
		 * @type {[type]}
		 */
		push,
		/**
		 * [description]
		 * @param  {Array}   batchData 					Array of task payload
		 * @param  {Number}  options.batchSize 			Default is 200
		 * @param  {Number}  options.timeout 			Default 10,000. Used to configure the length of the retry strategy
		 * @param  {Number}  options.retryCatch 		If sepcified, this function will deal with managing exception in case
		 *                                        		the retry attempts all fail. If this option is not specified, a single failure
		 *                                        		will cause the interruption of the entire batch  
		 * @param  {Boolean} options.debug  			Default is false. Shows details if set to true         
		 * @return {[type]} 							[description]
		 */
		batch: (batchData, options={}) => Promise.resolve(null).then(() => {
			options = options || {}
			if (!batchData)
				return { status: 200, data: {} }
			if (!Array.isArray(batchData))
				throw new Error('Wrong argument exception. \'batchData\' must be an array.')

			const batchSize = options.batchSize && options.batchSize > 0 ? options.batchSize : 200
			return collection.batch(batchData, batchSize).reduce((runJob, taskDataBatch) => 
				runJob.then(taskResponses => {
					const start = Date.now()
					return Promise.all(taskDataBatch.map(t => push(t, options).catch(err => ({ id: t.id, error: { status: err.status, message: err.message } }))))
						.then(values => {
							if (options.debug)
								console.log(`Batch with ${taskDataBatch.length} tasks has been enqueued in ${((Date.now() - start)/1000).toFixed(2)} seconds`)
							return values.reduce((acc, data) => {
								if (data)
									acc.push(data)
								return acc
							}, taskResponses)
						})
				}), Promise.resolve([]))
				.then(responses => {
					responses = responses || []
					const failedTasks = responses.filter(x => x.error)
					const failedCount = failedTasks.length
					if (failedCount > 0) {
						let e = new Error(`${failedCount} task${failedCount > 1 ? 's' : ''} failed and ${batchData.length - failedCount} succeeded (out of ${batchData.length} pushed tasks)`)
						e.data = failedTasks
						throw e
					} else
						return responses
				})
		})
	}

	return {
		push: service.push,
		batch: service.batch,
		task: (pathName, options={}) => {
			if (pathName && typeof(pathName) == 'string') 
				pathName = pathName.trim()
			const pathNameIsOptions = typeof(pathName) == 'object'
			const { method:_method, headers:_headers } = pathNameIsOptions ? pathName : (options || {})
			const p = pathNameIsOptions ? pathname : (pathName || pathname)
			const filter = pathName ? (({ pathname }) => pathname == `/${pathName.replace(/(^\/*|\/*$)/g, '')}`) : null

			const find = (fn, options={}) => getTheToken(auth)
				.then(token => {
					if (!fn)
						throw new Error('Missing required \'fn\' argument.')
					if (typeof(fn) != 'function')
						throw new Error(`Invalid argument exception. 'fn' must be a function (current: ${typeof(fn)}).`)

					return _retryFn(
						() => findTask({ projectId: project_id, locationId: location_id, queueName: queue, token, find: fn }, { filter }),
						options)
				})

			return {
				list: (options={}) => getTheToken(auth)
					.then(token => _retryFn(
						() => listTasks({ projectId: project_id, locationId: location_id, queueName: queue, token }, { filter }), 
						options)),
				find,
				some: (fn, options={}) => find(fn, options).then(result => result ? true : false),
				send: (task, options={}) => Promise.resolve(null).then(() => {
					const optionsType = typeof(options)
					const optionsIsFn = optionsType == 'function'
					if (optionsType != 'object' && !optionsIsFn)
						throw new Error('Invalid argument exception. \'options\' must either be an object or a function returning an object.')

					const optionsFn = optionsIsFn ? options : () => options
					const getParams = t => {
						const { id, headers:__headers, schedule } = optionsFn(t) || {} 
						const h = merge(headers, _headers, __headers)
						return { id, schedule, headers: h }
					}
					
					if (Array.isArray(task)) {
						let firstOptions = null
						const batchTasks = task.map(t => {
							if (!firstOptions)
								firstOptions = optionsFn(t)
							const { id, schedule, headers } = getParams(t)
							return {
								id, 
								method: _method || method, 
								schedule, 
								pathname: p, 
								headers, 
								body: t
							}
						})
						return service.batch(batchTasks, firstOptions)
					} else {
						const firstOptions = optionsFn(task)
						const { id, schedule, headers } = getParams(task)
						return service.push({
							id, 
							method: _method || method, 
							schedule, 
							pathname: p, 
							headers, 
							body: task
						}, firstOptions)
					}
				})
			}
		}
	}
}

const isHeadersFromCloudTask = headers => {
	headers = headers || {}
	const queueName = headers['x-appengine-queuename']
	return headers['x-appengine-taskname'] && (queueName && queueName != '__cron') ? true : false
}

const isHeadersFromCron = headers => {
	headers = headers || {}
	const queueName = headers['x-appengine-queuename']
	return headers['x-appengine-taskname'] && (queueName && queueName == '__cron') ? true : false
}

const isRequestFromCloudTask = req => {
	req = req || {}
	return isHeadersFromCloudTask(req.headers) || isHeadersFromCloudTask(req)
}

const isRequestFromCron = req => {
	req = req || {}
	return isHeadersFromCron(req.headers) || isHeadersFromCron(req)
}

const formatTaskId = id => encodeURIComponent(id || '').replace(/[^a-zA-Z0-9-_]/g, '')

module.exports = {
	client: {
		new: createClient
	},
	utils: {
		isTaskRequest: isRequestFromCloudTask,
		isCronRequest: isRequestFromCron,
		formatTaskId
	}
}



