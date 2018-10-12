/**
 * Copyright (c) 2018, Neap Pty Ltd.
 * All rights reserved.
 * 
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const googleAuth = require('google-auto-auth')
const { fetch, promise: { retry }, collection } = require('./utils')

const getToken = auth => new Promise((onSuccess, onFailure) => auth.getToken((err, token) => err ? onFailure(err) : onSuccess(token)))
const APP_ENG_PUSH_TASK_URL = (projectId, locationId, queueName) => `https://cloudtasks.googleapis.com/v2beta3/projects/${projectId}/locations/${locationId}/queues/${queueName}/tasks`

const _validateRequiredParams = (params={}) => Object.keys(params).forEach(p => {
	if (!params[p])
		throw new Error(`Parameter '${p}' is required.`)
})

const pushTask = (projectId, locationId, queueName, token, method, pathname, body) => Promise.resolve(null).then(() => {
	_validateRequiredParams({ projectId, locationId, queueName, token, method })
	const m = method.toUpperCase()
	let request = {
		httpMethod: m,
		relativeUri: pathname || '/'
	}
	if (m != 'GET' && body)
		request.body = Buffer.from(JSON.stringify(body)).toString('base64')

	return fetch.post(APP_ENG_PUSH_TASK_URL(projectId, locationId, queueName), {
		Accept: 'application/json',
		Authorization: `Bearer ${token}`
	}, JSON.stringify({
		task: { appEngineHttpRequest: request },
		responseView: 'FULL'
	}))
})

const HTTP_METHODS = { 'GET': true, 'POST': true, 'PUT': true, 'DELETE': true, 'PATCH': true, 'OPTIONS': true, 'HEAD': true }
const createClient = ({ queue, method, pathname, jsonKeyFile}) => {
	_validateRequiredParams({ queue, method, jsonKeyFile })
	method = method.trim().toUpperCase()
	
	if (!HTTP_METHODS[method])
		throw new Error(`Invalid argument exception. Method '${method}' is not a valid HTTP method.`)

	const { location_id, project_id } = require(jsonKeyFile)
	
	if (!project_id)
		throw new Error(`Missing required 'project_id' property. This property should be present inside the service account json file ${jsonKeyFile}.`)
	if (!location_id)
		throw new Error(`Missing required 'location_id' property. This property should be present inside the service account json file ${jsonKeyFile}. It contains the location where the Google Cloud Task Queue is hosted.`)
	
	const auth = googleAuth({ 
		keyFilename: jsonKeyFile,
		scopes: ['https://www.googleapis.com/auth/cloud-platform']
	})

	const push = taskData => { 
		const relativeUri = taskData && typeof(taskData) == 'string' ? taskData : pathname
		const body = taskData && typeof(taskData) == 'object' ? taskData : {}
		return getToken(auth)
			.then(token => pushTask(project_id, location_id, queue, token, method, relativeUri, body))
	}

	const retryPush = (taskData, options={}) => retry(() => push(taskData), () => true, { ignoreFailure: true, retryInterval: 800 })
		.catch(e => {
			if (options.retryCatch)
				return options.retryCatch(e)
			else
				throw e
		})

	return {
		/**
		 * [description]
		 * @param  {Object}  taskData 					Task payload
		 * @param  {Number}  options.retryCatch 		If sepcified, this function will deal with managing exception in case
		 *                                        		the retry attempts all fail. If this option is not specified,  
		 * @type {[type]}
		 */
		push: retryPush,
		/**
		 * [description]
		 * @param  {Array}   batchData 					Array of task payload
		 * @param  {Number}  options.batchSize 			Default is 200
		 * @param  {Number}  options.retryCatch 		If sepcified, this function will deal with managing exception in case
		 *                                        		the retry attempts all fail. If this option is not specified, a single failure
		 *                                        		will cause the interruption of the entire batch  
		 * @param  {Boolean} options.debug  			Default is false. Shows details if set to true         
		 * @return {[type]} 							[description]
		 */
		batch: (batchData, options={}) => Promise.resolve(null).then(() => {
			if (!batchData)
				return { status: 200, data: {} }
			if (!Array.isArray(batchData))
				throw new Error('Wrong argument exception. \'batchData\' must be an array.')

			const batchSize = options.batchSize && options.batchSize > 0 ? options.batchSize : 200
			return collection.batch(batchData, batchSize).reduce((runJob, taskDataBatch) => 
				runJob.then(() => {
					const start = Date.now()
					return Promise.all(taskDataBatch.map(t => retryPush(t))).then(() => {
						if (options.debug)
							console.log(`Batch with ${taskDataBatch.length} tasks has been enqueued in ${((Date.now() - start)/1000).toFixed(2)} seconds`)
					})
				}), 
			Promise.resolve(null))
				.then(() => ({ status: 200, data: {} }))
		})
	}
}

module.exports = createClient



