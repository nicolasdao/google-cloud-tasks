/**
 * Copyright (c) 2018, Neap Pty Ltd.
 * All rights reserved.
 * 
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

/* global describe */
/* global it */

const { assert } = require('chai')
const { client } = require('../index')

const projectId = 'my-super-project'
const locationId = 'asia-northeast1'
const queueName = 'your-queue-name'
const token = '12345'
const mockFn = {
	getJsonKey: () => ({ location_id: locationId, project_id: projectId }),
	getToken: () => Promise.resolve(token),
	pushTask: task => Promise.resolve({ status: 200, data: task })
}

const jsonKeyFile = './service-account.json'

describe('client', () => {
	describe('#queue.push', () => {
		it('01 - Should push a task to the queue.', () => {
			const queue = client.new({
				name: queueName,
				method: 'POST',
				pathname: '/hello',
				jsonKeyFile,
				mockFn
			})

			const task_01 = { 
				body: { 
					name: 'task #1', 
					otherData: {
						age: 23
					} 
				} 
			}

			return queue.push(task_01).then(data => {
				assert.isNotOk(data.id, '01')
				assert.isNotOk(data.schedule, '02')
				assert.equal(data.projectId, projectId, '03')
				assert.equal(data.locationId, locationId, '04')
				assert.equal(data.locationId, locationId, '05')
				assert.equal(data.queueName, queueName, '06')
				assert.equal(data.token, token, '07')
				assert.equal(data.method, 'POST', '08')
				assert.equal(data.pathname, '/hello', '09')
				assert.isOk(data.headers, '10')
				assert.equal(Object.keys(data.headers).length, 0, '11')
				assert.equal(data.body.name, 'task #1', '12')
				assert.equal(data.body.otherData.age, 23, '13')
			})
		})
		it('02 - Should default to \'GET\' method and \'/\' pathname when pushing a task to the queue.', () => {
			const queue = client.new({
				name: queueName,
				jsonKeyFile,
				mockFn
			})

			const task_01 = { 
				body: { 
					name: 'task #1', 
					otherData: {
						age: 23
					} 
				} 
			}

			return queue.push(task_01).then(data => {
				assert.isNotOk(data.id, '01')
				assert.isNotOk(data.schedule, '02')
				assert.equal(data.projectId, projectId, '03')
				assert.equal(data.locationId, locationId, '04')
				assert.equal(data.locationId, locationId, '05')
				assert.equal(data.queueName, queueName, '06')
				assert.equal(data.token, token, '07')
				assert.equal(data.method, 'GET', '08')
				assert.equal(data.pathname, '/', '09')
				assert.isOk(data.headers, '10')
				assert.equal(Object.keys(data.headers).length, 0, '11')
				assert.equal(data.body.name, 'task #1', '12')
				assert.equal(data.body.otherData.age, 23, '13')
			})
		})
		it('03 - Should accept adding custom headers.', () => {
			const queue = client.new({
				name: queueName,
				jsonKeyFile,
				headers: {
					Accept: 'application/json',
					Authorization: 'bearer: 12344',
				},
				mockFn
			})

			const task_01 = { 
				body: { 
					name: 'task #1', 
					otherData: {
						age: 23
					} 
				} 
			}

			return queue.push(task_01).then(data => {
				assert.isNotOk(data.id, '01')
				assert.isNotOk(data.schedule, '02')
				assert.equal(data.projectId, projectId, '03')
				assert.equal(data.locationId, locationId, '04')
				assert.equal(data.locationId, locationId, '05')
				assert.equal(data.queueName, queueName, '06')
				assert.equal(data.token, token, '07')
				assert.equal(data.method, 'GET', '08')
				assert.equal(data.pathname, '/', '09')
				assert.isOk(data.headers, '10')
				assert.equal(Object.keys(data.headers).length, 2, '11')
				assert.equal(data.body.name, 'task #1', '12')
				assert.equal(data.body.otherData.age, 23, '13')
				assert.equal(data.headers.Accept, 'application/json', '14')
				assert.equal(data.headers.Authorization, 'bearer: 12344', '15')
			})
		})
		it('04 - Should override the queue settings.', () => {
			const queue = client.new({
				name: queueName,
				pathname: '/a-path',
				jsonKeyFile,
				headers: {
					Accept: 'application/json',
					Authorization: 'bearer: 12344',
				},
				mockFn
			})

			const task_01 = { 
				id: 1,
				method: 'POST',
				schedule: new Date(4105083600000),
				pathname: '/another-path',
				headers: {
					someMore: 'headers'
				},
				body: { 
					name: 'task #1', 
					otherData: {
						age: 23
					} 
				} 
			}

			return queue.push(task_01).then(data => {
				assert.equal(data.id, 1,'01')
				assert.equal(data.schedule, '2100-01-31T13:00:00.000Z','02')
				assert.equal(data.projectId, projectId, '03')
				assert.equal(data.locationId, locationId, '04')
				assert.equal(data.locationId, locationId, '05')
				assert.equal(data.queueName, queueName, '06')
				assert.equal(data.token, token, '07')
				assert.equal(data.method, 'POST', '08')
				assert.equal(data.pathname, '/another-path', '09')
				assert.isOk(data.headers, '10')
				assert.equal(Object.keys(data.headers).length, 3, '11')
				assert.equal(data.body.name, 'task #1', '12')
				assert.equal(data.body.otherData.age, 23, '13')
				assert.equal(data.headers.Accept, 'application/json', '14')
				assert.equal(data.headers.Authorization, 'bearer: 12344', '15')
				assert.equal(data.headers.someMore, 'headers', '16')
			})
		})
		it('05 - Should throw an error if the \'schedule\' is an invalid date.', () => {
			const queue = client.new({
				name: queueName,
				pathname: '/a-path',
				jsonKeyFile,
				headers: {
					Accept: 'application/json',
					Authorization: 'bearer: 12344',
				},
				mockFn
			})

			const task_01 = { 
				id: 1,
				method: 'POST',
				schedule: 'dewde',
				pathname: '/another-path',
				headers: {
					someMore: 'headers'
				},
				body: { 
					name: 'task #1', 
					otherData: {
						age: 23
					} 
				} 
			}

			return queue.push(task_01)
				.catch(error => ({ error }))
				.then(({ error, data }) => {
					assert.isNotOk(data, '01 - Should have failed')
					assert.isOk(error, '02 - Should have failed')
					assert.equal(error.message, 'Invalid argument exception. \'schedule\' dewde is an invalid date', '03')
				})
		})
	})

	describe('#queue.batch', () => {
		it('01 - Should push multiple tasks to the queue.', () => {
			const queue = client.new({
				name: queueName,
				method: 'POST',
				pathname: '/hello',
				jsonKeyFile,
				mockFn
			})

			const task_01 = { 
				body: { 
					name: 'task #1', 
					otherData: {
						age: 23
					} 
				} 
			}

			const task_02 = { 
				body: { 
					name: 'task #2', 
					otherData: {
						age: 233
					} 
				} 
			}

			return queue.batch([task_01, task_02]).then(data => {
				assert.isNotOk(data[0].id, '01')
				assert.isNotOk(data[0].schedule, '02')
				assert.equal(data[0].projectId, projectId, '03')
				assert.equal(data[0].locationId, locationId, '04')
				assert.equal(data[0].locationId, locationId, '05')
				assert.equal(data[0].queueName, queueName, '06')
				assert.equal(data[0].token, token, '07')
				assert.equal(data[0].method, 'POST', '08')
				assert.equal(data[0].pathname, '/hello', '09')
				assert.isOk(data[0].headers, '10')
				assert.equal(Object.keys(data[0].headers).length, 0, '11')
				assert.equal(data[0].body.name, 'task #1', '12')
				assert.equal(data[0].body.otherData.age, 23, '13')

				assert.isNotOk(data[1].id, '01_B')
				assert.isNotOk(data[1].schedule, '02_B')
				assert.equal(data[1].projectId, projectId, '03_B')
				assert.equal(data[1].locationId, locationId, '04_B')
				assert.equal(data[1].locationId, locationId, '05_B')
				assert.equal(data[1].queueName, queueName, '06_B')
				assert.equal(data[1].token, token, '07_B')
				assert.equal(data[1].method, 'POST', '08_B')
				assert.equal(data[1].pathname, '/hello', '09_B')
				assert.isOk(data[1].headers, '10_B')
				assert.equal(Object.keys(data[1].headers).length, 0, '11_B')
				assert.equal(data[1].body.name, 'task #2', '12_B')
				assert.equal(data[1].body.otherData.age, 233, '13_B')
			})
		})
		it('02 - Should default to \'GET\' method and \'/\' pathname when pushing multiple tasks to the queue.', () => {
			const queue = client.new({
				name: queueName,
				jsonKeyFile,
				mockFn
			})

			const task_01 = { 
				body: { 
					name: 'task #1', 
					otherData: {
						age: 23
					} 
				} 
			}

			const task_02 = { 
				body: { 
					name: 'task #2', 
					otherData: {
						age: 233
					} 
				} 
			}

			return queue.batch([task_01,task_02]).then(data => {
				assert.isNotOk(data[0].id, '01')
				assert.isNotOk(data[0].schedule, '02')
				assert.equal(data[0].projectId, projectId, '03')
				assert.equal(data[0].locationId, locationId, '04')
				assert.equal(data[0].locationId, locationId, '05')
				assert.equal(data[0].queueName, queueName, '06')
				assert.equal(data[0].token, token, '07')
				assert.equal(data[0].method, 'GET', '08')
				assert.equal(data[0].pathname, '/', '09')
				assert.isOk(data[0].headers, '10')
				assert.equal(Object.keys(data[0].headers).length, 0, '11')
				assert.equal(data[0].body.name, 'task #1', '12')
				assert.equal(data[0].body.otherData.age, 23, '13')

				assert.isNotOk(data[1].id, '01_B')
				assert.isNotOk(data[1].schedule, '02_B')
				assert.equal(data[1].projectId, projectId, '03_B')
				assert.equal(data[1].locationId, locationId, '04_B')
				assert.equal(data[1].locationId, locationId, '05_B')
				assert.equal(data[1].queueName, queueName, '06_B')
				assert.equal(data[1].token, token, '07_B')
				assert.equal(data[1].method, 'GET', '08_B')
				assert.equal(data[1].pathname, '/', '09_B')
				assert.isOk(data[1].headers, '10_B')
				assert.equal(Object.keys(data[1].headers).length, 0, '11_B')
				assert.equal(data[1].body.name, 'task #2', '12_B')
				assert.equal(data[1].body.otherData.age, 233, '13_B')
			})
		})
		it('03 - Should accept adding custom headers.', () => {
			const queue = client.new({
				name: queueName,
				jsonKeyFile,
				headers: {
					Accept: 'application/json',
					Authorization: 'bearer: 12344',
				},
				mockFn
			})

			const task_01 = { 
				body: { 
					name: 'task #1', 
					otherData: {
						age: 23
					} 
				} 
			}

			const task_02 = { 
				body: { 
					name: 'task #2', 
					otherData: {
						age: 233
					} 
				} 
			}

			return queue.batch([task_01, task_02]).then(data => {
				assert.isNotOk(data[0].id, '01')
				assert.isNotOk(data[0].schedule, '02')
				assert.equal(data[0].projectId, projectId, '03')
				assert.equal(data[0].locationId, locationId, '04')
				assert.equal(data[0].locationId, locationId, '05')
				assert.equal(data[0].queueName, queueName, '06')
				assert.equal(data[0].token, token, '07')
				assert.equal(data[0].method, 'GET', '08')
				assert.equal(data[0].pathname, '/', '09')
				assert.isOk(data[0].headers, '10')
				assert.equal(Object.keys(data[0].headers).length, 2, '11')
				assert.equal(data[0].body.name, 'task #1', '12')
				assert.equal(data[0].body.otherData.age, 23, '13')
				assert.equal(data[0].headers.Accept, 'application/json', '14')
				assert.equal(data[0].headers.Authorization, 'bearer: 12344', '15')

				assert.isNotOk(data[1].id, '01_B')
				assert.isNotOk(data[1].schedule, '02_B')
				assert.equal(data[1].projectId, projectId, '03_B')
				assert.equal(data[1].locationId, locationId, '04_B')
				assert.equal(data[1].locationId, locationId, '05_B')
				assert.equal(data[1].queueName, queueName, '06_B')
				assert.equal(data[1].token, token, '07_B')
				assert.equal(data[1].method, 'GET', '08_B')
				assert.equal(data[1].pathname, '/', '09_B')
				assert.isOk(data[1].headers, '10_B')
				assert.equal(Object.keys(data[1].headers).length, 2, '11_B')
				assert.equal(data[1].body.name, 'task #2', '12_B')
				assert.equal(data[1].body.otherData.age, 233, '13_B')
				assert.equal(data[1].headers.Accept, 'application/json', '14_B')
				assert.equal(data[1].headers.Authorization, 'bearer: 12344', '15_B')
			})
		})
		it('04 - Should override the queue settings.', () => {
			const queue = client.new({
				name: queueName,
				pathname: '/a-path',
				jsonKeyFile,
				headers: {
					Accept: 'application/json',
					Authorization: 'bearer: 12344',
				},
				mockFn
			})

			const task_01 = { 
				id: 1,
				method: 'POST',
				schedule: new Date(4105083600000),
				pathname: '/another-path',
				headers: {
					someMore: 'headers'
				},
				body: { 
					name: 'task #1', 
					otherData: {
						age: 23
					} 
				} 
			}
			const task_02 = { 
				id: 2,
				method: 'PUT',
				schedule: new Date(7260757200000),
				pathname: '/another-path',
				headers: {
					someMore2: 'headers2'
				},
				body: { 
					name: 'task #2', 
					otherData: {
						age: 233
					} 
				} 
			}

			return queue.batch([task_01,task_02]).then(data => {
				assert.equal(data[0].id, 1,'01')
				assert.equal(data[0].schedule, '2100-01-31T13:00:00.000Z','02')
				assert.equal(data[0].projectId, projectId, '03')
				assert.equal(data[0].locationId, locationId, '04')
				assert.equal(data[0].locationId, locationId, '05')
				assert.equal(data[0].queueName, queueName, '06')
				assert.equal(data[0].token, token, '07')
				assert.equal(data[0].method, 'POST', '08')
				assert.equal(data[0].pathname, '/another-path', '09')
				assert.isOk(data[0].headers, '10')
				assert.equal(Object.keys(data[0].headers).length, 3, '11')
				assert.equal(data[0].body.name, 'task #1', '12')
				assert.equal(data[0].body.otherData.age, 23, '13')
				assert.equal(data[0].headers.Accept, 'application/json', '14')
				assert.equal(data[0].headers.Authorization, 'bearer: 12344', '15')
				assert.equal(data[0].headers.someMore, 'headers', '16')

				assert.equal(data[1].id, 2,'01_B')
				assert.equal(data[1].schedule, '2200-01-31T13:00:00.000Z','02_B')
				assert.equal(data[1].projectId, projectId, '03_B')
				assert.equal(data[1].locationId, locationId, '04_B')
				assert.equal(data[1].locationId, locationId, '05_B')
				assert.equal(data[1].queueName, queueName, '06_B')
				assert.equal(data[1].token, token, '07_B')
				assert.equal(data[1].method, 'PUT', '08_B')
				assert.equal(data[1].pathname, '/another-path', '09_B')
				assert.isOk(data[1].headers, '10_B')
				assert.equal(Object.keys(data[1].headers).length, 3, '11_B')
				assert.equal(data[1].body.name, 'task #2', '12_B')
				assert.equal(data[1].body.otherData.age, 233, '13_B')
				assert.equal(data[1].headers.Accept, 'application/json', '14_B')
				assert.equal(data[1].headers.Authorization, 'bearer: 12344', '15_B')
				assert.equal(data[1].headers.someMore2, 'headers2', '16_B')
			})
		})
		it('05 - Should throw an error if the \'schedule\' is an invalid date.', () => {
			const queue = client.new({
				name: queueName,
				pathname: '/a-path',
				jsonKeyFile,
				headers: {
					Accept: 'application/json',
					Authorization: 'bearer: 12344',
				},
				mockFn
			})

			const task_01 = { 
				id: 1,
				method: 'POST',
				schedule: 'dewde',
				pathname: '/another-path',
				headers: {
					someMore: 'headers'
				},
				body: { 
					name: 'task #1', 
					otherData: {
						age: 23
					} 
				} 
			}
			const task_02 = { 
				id: 2,
				method: 'PUT',
				schedule: new Date(7260757200000),
				pathname: '/another-path',
				headers: {
					someMore2: 'headers2'
				},
				body: { 
					name: 'task #2', 
					otherData: {
						age: 233
					} 
				} 
			}

			return queue.batch([task_01,task_02])
				.then(data => ({ data, error:null }))
				.catch(err => ({ error: err.message }))
				.then(({ error }) => {
					assert.equal(error, 'Invalid argument exception. \'schedule\' dewde is an invalid date')
				})
		})
	})
	describe('#queue.task().send', () => {
		it('01 - Should push a task to the queue.', () => {
			const queue = client.new({
				name: queueName,
				method: 'POST',
				jsonKeyFile,
				mockFn
			})

			const task_01 = {  
				name: 'task #1', 
				otherData: {
					age: 23
				} 
			}

			return queue.task('service-01').send(task_01).then(data => {
				assert.isNotOk(data.id, '01')
				assert.isNotOk(data.schedule, '02')
				assert.equal(data.projectId, projectId, '03')
				assert.equal(data.locationId, locationId, '04')
				assert.equal(data.locationId, locationId, '05')
				assert.equal(data.queueName, queueName, '06')
				assert.equal(data.token, token, '07')
				assert.equal(data.method, 'POST', '08')
				assert.equal(data.pathname, 'service-01', '09')
				assert.isOk(data.headers, '10')
				assert.equal(Object.keys(data.headers).length, 0, '11')
				assert.equal(data.body.name, 'task #1', '12')
				assert.equal(data.body.otherData.age, 23, '13')
			})
		})
		it('02 - Should default to \'GET\' method and \'/\' pathname when pushing multiple tasks to the queue.', () => {
			const queue = client.new({
				name: queueName,
				jsonKeyFile,
				mockFn
			})

			const task_01 = {  
				name: 'task #1', 
				otherData: {
					age: 23
				} 
			}

			return queue.task().send(task_01).then(data => {
				assert.isNotOk(data.id, '01')
				assert.isNotOk(data.schedule, '02')
				assert.equal(data.projectId, projectId, '03')
				assert.equal(data.locationId, locationId, '04')
				assert.equal(data.locationId, locationId, '05')
				assert.equal(data.queueName, queueName, '06')
				assert.equal(data.token, token, '07')
				assert.equal(data.method, 'GET', '08')
				assert.equal(data.pathname, '/', '09')
				assert.isOk(data.headers, '10')
				assert.equal(Object.keys(data.headers).length, 0, '11')
				assert.equal(data.body.name, 'task #1', '12')
				assert.equal(data.body.otherData.age, 23, '13')
			})
		})
		it('03 - Should accept adding custom headers.', () => {
			const queue = client.new({
				name: queueName,
				method: 'POST',
				headers: {
					Accept: 'application/json'
				},
				jsonKeyFile,
				mockFn
			})

			const task_01 = {  
				name: 'task #1', 
				otherData: {
					age: 23
				} 
			}

			return Promise.all([queue
				.task('service-01', { headers: { Authorization: 'bearer: 12334' } })
				.send(task_01, { headers: { someOther: 'header' }, schedule: new Date(4105083600000) }),
			queue
				.task({ headers: { Authorization: 'bearer: 12334' } })
				.send(task_01, { headers: { someOther: 'header' }, schedule: new Date(4105083600000) })])
				.then(([data_01, data_02]) => {
					
					assert.isNotOk(data_01.id, '01')
					assert.equal(data_01.schedule, '2100-01-31T13:00:00.000Z', '02')
					assert.equal(data_01.projectId, projectId, '03')
					assert.equal(data_01.locationId, locationId, '04')
					assert.equal(data_01.locationId, locationId, '05')
					assert.equal(data_01.queueName, queueName, '06')
					assert.equal(data_01.token, token, '07')
					assert.equal(data_01.method, 'POST', '08')
					assert.equal(data_01.pathname, 'service-01', '09')
					assert.isOk(data_01.headers, '10')
					assert.equal(Object.keys(data_01.headers).length, 3, '11')
					assert.equal(data_01.body.name, 'task #1', '12')
					assert.equal(data_01.body.otherData.age, 23, '13')
					assert.equal(data_01.headers.Accept, 'application/json', '14')
					assert.equal(data_01.headers.Authorization, 'bearer: 12334', '15')
					assert.equal(data_01.headers.someOther, 'header', '16')

					assert.isNotOk(data_02.id, '01_B')
					assert.equal(data_02.schedule, '2100-01-31T13:00:00.000Z', '02_B')
					assert.equal(data_02.projectId, projectId, '03_B')
					assert.equal(data_02.locationId, locationId, '04_B')
					assert.equal(data_02.locationId, locationId, '05_B')
					assert.equal(data_02.queueName, queueName, '06_B')
					assert.equal(data_02.token, token, '07_B')
					assert.equal(data_02.method, 'POST', '08_B')
					assert.equal(data_02.pathname, '/', '09_B')
					assert.isOk(data_02.headers, '10_B')
					assert.equal(Object.keys(data_02.headers).length, 3, '11_B')
					assert.equal(data_02.body.name, 'task #1', '12_B')
					assert.equal(data_02.body.otherData.age, 23, '13_B')
					assert.equal(data_02.headers.Accept, 'application/json', '14_B')
					assert.equal(data_02.headers.Authorization, 'bearer: 12334', '15_B')
					assert.equal(data_02.headers.someOther, 'header', '16_B')
				})
		})
		it('04 - Should throw an error if the \'schedule\' is an invalid date.', () => {
			const queue = client.new({
				name: queueName,
				method: 'POST',
				headers: {
					Accept: 'application/json'
				},
				jsonKeyFile,
				mockFn
			})

			const task_01 = {  
				name: 'task #1', 
				otherData: {
					age: 23
				} 
			}

			return queue
				.task('service-01', { headers: { Authorization: 'bearer: 12334' } })
				.send(task_01, { headers: { someOther: 'header' }, schedule: 'dewde' })
				.catch(error => ({ error }))
				.then(({ error, data }) => {
					assert.isNotOk(data, '01 - Should have failed')
					assert.isOk(error, '02 - Should have failed')
					assert.equal(error.message, 'Invalid argument exception. \'schedule\' dewde is an invalid date', '03')
				})
		})
		it('05 - Should support options as a function.', () => {
			const queue = client.new({
				name: queueName,
				method: 'POST',
				headers: {
					Accept: 'application/json'
				},
				jsonKeyFile,
				mockFn
			})

			const task_01 = {  
				name: 'task #1', 
				otherData: {
					age: 23
				} 
			}

			return queue
				.task('service-01', { headers: { Authorization: 'bearer: 12334' } })
				.send(task_01, t => ({ id: t.name, headers: { someOther: 'header' } }))
				.then(data => {
					assert.equal(data.id, 'task #1', '01')
					assert.isNotOk(data.schedule, '02')
					assert.equal(data.projectId, projectId, '03')
					assert.equal(data.locationId, locationId, '04')
					assert.equal(data.locationId, locationId, '05')
					assert.equal(data.queueName, queueName, '06')
					assert.equal(data.token, token, '07')
					assert.equal(data.method, 'POST', '08')
					assert.equal(data.pathname, 'service-01', '09')
					assert.isOk(data.headers, '10')
					assert.equal(Object.keys(data.headers).length, 3, '11')
					assert.equal(data.body.name, 'task #1', '12')
					assert.equal(data.body.otherData.age, 23, '13')
					assert.equal(data.headers.Accept, 'application/json', '14')
					assert.equal(data.headers.Authorization, 'bearer: 12334', '15')
					assert.equal(data.headers.someOther, 'header', '16')
				})
		})
		it('06 - Should sending multiple tasks at once.', () => {
			const queue = client.new({
				name: queueName,
				method: 'POST',
				headers: {
					Accept: 'application/json'
				},
				jsonKeyFile,
				mockFn
			})

			const task_01 = {  
				name: 'task #1', 
				otherData: {
					age: 23
				} 
			}

			const task_02 = {  
				name: 'task #2', 
				otherData: {
					age: 233
				} 
			}

			return queue
				.task('service-01', { headers: { Authorization: 'bearer: 12334' } })
				.send([task_01,task_02], t => ({ id: t.name, headers: { someOther: 'header' } }))
				.then(data => {
					assert.equal(data[0].id, 'task #1', '01')
					assert.isNotOk(data[0].schedule, '02')
					assert.equal(data[0].projectId, projectId, '03')
					assert.equal(data[0].locationId, locationId, '04')
					assert.equal(data[0].locationId, locationId, '05')
					assert.equal(data[0].queueName, queueName, '06')
					assert.equal(data[0].token, token, '07')
					assert.equal(data[0].method, 'POST', '08')
					assert.equal(data[0].pathname, 'service-01', '09')
					assert.isOk(data[0].headers, '10')
					assert.equal(Object.keys(data[0].headers).length, 3, '11')
					assert.equal(data[0].body.name, 'task #1', '12')
					assert.equal(data[0].body.otherData.age, 23, '13')
					assert.equal(data[0].headers.Accept, 'application/json', '14')
					assert.equal(data[0].headers.Authorization, 'bearer: 12334', '15')
					assert.equal(data[0].headers.someOther, 'header', '16')

					assert.equal(data[1].id, 'task #2', '01')
					assert.isNotOk(data[1].schedule, '02')
					assert.equal(data[1].projectId, projectId, '03')
					assert.equal(data[1].locationId, locationId, '04')
					assert.equal(data[1].locationId, locationId, '05')
					assert.equal(data[1].queueName, queueName, '06')
					assert.equal(data[1].token, token, '07')
					assert.equal(data[1].method, 'POST', '08')
					assert.equal(data[1].pathname, 'service-01', '09')
					assert.isOk(data[1].headers, '10')
					assert.equal(Object.keys(data[1].headers).length, 3, '11')
					assert.equal(data[1].body.name, 'task #2', '12')
					assert.equal(data[1].body.otherData.age, 233, '13')
					assert.equal(data[1].headers.Accept, 'application/json', '14')
					assert.equal(data[1].headers.Authorization, 'bearer: 12334', '15')
					assert.equal(data[1].headers.someOther, 'header', '16')
				})
		})
	})
})