# Google Cloud Tasks &middot;  [![NPM](https://img.shields.io/npm/v/google-cloud-tasks.svg?style=flat)](https://www.npmjs.com/package/google-cloud-tasks) [![Tests](https://travis-ci.org/nicolasdao/google-cloud-tasks.svg?branch=master)](https://travis-ci.org/nicolasdao/google-cloud-tasks) [![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause) [![Neap](https://neap.co/img/made_by_neap.svg)](#this-is-what-we-re-up-to)
__*Google Cloud Tasks*__ is node.js package to push tasks to Google Cloud Tasks (beta). It also include pushing tasks in batches.

# Table of Contents

> * [Install](#install) 
> * [Getting Started](#getting-started)
>	- [Prerequisite](#prerequisite)
>	- [Basics](#basics)
>	- [Four ways to create a client](#four-ways-to-create-a-client)
>		- [User the hosting identity](#user-the-hosting-identity)
>		- [Using a `service-account.json`](#using-a-service-accountjson)
>		- [Using explicit credentials](#using-explicit-credentials)
>		- [Using environment variables](#using-environment-variables)
>	- [How To Test Locally](#how-to-test-locally)
>	- [Other Utilities](#other-utilities)
>	- [Minimizing Network Errors](#minimizing-network-errors)
> * [About Neap](#this-is-what-we-re-up-to)
> * [Annexes](#annexes)
>	- [Available Regions](#available-regions)
> * [License](#license)


# Install
```
npm i google-cloud-tasks --save
```

# Getting Started

## Prerequisite

Before using this package, you must first:

1. Have a Google Cloud Account.
2. Have a Project in that Google Account (the next step are specific to that Project). __WARNING__: As of today (June 2019), Google Cloud Tasks API is in beta. That means that not all locations are available. Make sure that your App Engine is running in one of the regions described in the [Annexes](#annexes)/[Available Regions](#available-regions).
> Google keeps adding more location until this service moves from beta to GA. You can double the latest list at [https://cloud.google.com/tasks/docs/dual-overview](https://cloud.google.com/tasks/docs/dual-overview). 
3. Have an App Engine service running.
4. Have a Task Queue configured to push tasks to the App Engine service above.
5. Have a Service Account or a hosting service associated with a service account set up with the following 3 roles :
	- `roles/appengine.appViewer`
	- `roles/cloudtasks.enqueuer`
	- `roles/cloudtasks.viewer`

If hosting environment is Cloud Compute, App Engine, Cloud Function or Cloud Run, and if their associated service account has all the roles above, then that's it. If, on the other hand, you wish to use a service account to explicitly create a new client, then:

1. Get the JSON keys file for that Service Account above
2. Save that JSON key into a `service-account.json` file. Make sure it is located under a path that is accessible to your app (the root folder usually).
3. Add a `location_id` property into that `service-account.json` file. That property should contain the location of your App Engine. Because the Google Cloud Tasks API is currently in beta, only the regions described in the [Annexes](#annexes)/[Available Regions](#available-regions) are available.

## Basics

```js
const { join } = require('path')
const { client } = require('google-cloud-tasks')

// There is only one queue per App Engine service. If you have multiple App Engine microservices,
// you have to create a queue per service.
const queue = client.new({
	name: 'your-queue-name', // Required. This is the Google Cloud Task that points to a specific App Engine Service.
	method: 'POST',		 // Optional. Default 'GET'
	headers: {		 // Optional. Default {}
		Accept: 'application/json'
	},
	jsonKeyFile: join(__dirname, './service-account.json')	// Required
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
		age: 32
	} 
}

// Sending a single task to queue 'your-queue-name' using a 'POST' at the pathname 'pathname-01'
// with headers 'Accept: application/json'
queue.task('pathname-01').send(task_01)
	.then(({ status, data }) => console.log({ status, data }))

// Sending multiple tasks to queue 'your-queue-name' using a 'POST' at the pathname 'pathname-01'
// with headers 'Accept: application/json'
queue.task('pathname-01').send([task_01, task_02])
	.then(({ status, data, errors }) => console.log({ status, data, errors })) 	// data is an response array for each successfull task sent
																				// errors is an response array for each failed task

// Sending a single task to queue 'your-queue-name' using a 'POST' at the pathname '/'
// with headers 'Accept: application/json'
queue.task().send(task_01)
	.then(({ status, data }) => console.log({ status, data }))

// Sending a single task to queue 'your-queue-name' using a 'POST' at the pathname 'pathname-01'
// with headers 'Accept: application/json' and 'Authorization: 123'
queue.task('pathname-01', { headers: { Authorization: '123' } }).send(task_01)
	.then(({ status, data }) => console.log({ status, data }))

// Sending a single task to queue 'your-queue-name' using a 'POST' at the pathname 'pathname-01'
// with headers 'Accept: application/json', 'Authorization: 123' and 'Custom: some other data'
queue.task('pathname-01', { headers: { Authorization: '123' } }).send(task_01, { headers: { Custom: 'some other data' } })
	.then(({ status, data }) => console.log({ status, data }))

// Delaying to send a single task to queue 'your-queue-name' using a 'POST' at the pathname 'pathname-01'
// with headers 'Accept: application/json' and 'Custom: some other data' to the 1st of Feb 2020
queue.task('pathname-01').send(task_01, { schedule: new Date(2020,1,1), headers: { Custom: 'some other data' }})
	.then(({ status, data }) => console.log({ status, data }))

// Preventing to send the same task more than once to queue 'your-queue-name' using a 'POST' at the pathname 'pathname-01'
// with headers 'Accept: application/json' and 'Custom: some other data'. This is done by explicitely settin the task id. 
// That id must be unique. The second task will fail because the task with id 1 will already been added.
queue.task('pathname-01').send(task_01, { id:1, headers: { Custom: 'some other data' }})
	.then(({ status, data }) => console.log({ status, data }))
queue.task('pathname-01').send(task_01, { id:1, headers: { Custom: 'some other data' }})
	.then(({ status, data }) => console.log({ status, data }))

// Sending a single task to queue 'your-queue-name' using a 'POST' at the pathname 'pathname-01'
// with headers 'Accept: application/json' and 'Custom: some other data'. Explicitely setting the task id based on the task payload.
// NOTICE: 	In the example, the second argument of the 'send' method is not an object anymore, but a function. This function 
// 			is supposed to return an object.
queue.task('pathname-01').send(task_01, t => ({ id: t.otherData.age, headers: { Custom: 'some other data' } }))
	.then(({ status, data }) => console.log({ status, data }))
```

## Four ways to create a client

This library supports four different ways to create a client. The first method is the recommended way:
1. [User the hosting identity](#user-the-hosting-identity)
2. [Using a `service-account.json`](#using-a-service-accountjson)
3. [Using explicit credentials](#using-explicit-credentials)
4. [Using environment variables](#using-environment-variables)

### User the hosting identity

```js
const { client } = require('google-cloud-tasks')

// There is only one queue per App Engine service. If you have multiple App Engine microservices,
// you have to create a queue per service.
const queue = client.new({
	name: 'your-queue-name', // Required. This is the Google Cloud Task that points to a specific App Engine Service.
	method: 'POST',		 // Optional. Default 'GET'
	headers: {		 // Optional. Default {}
		Accept: 'application/json'
	},
	locationId: 'australia-southeast1'	// Required
})
```

In this case, the package fetches the credentials automatically. It will try three different techniques to get those data, and if none of them work, an error is thrown. Those techniques are:
1. If the code is hosted on GCP (e.g., Cloud Compute, App Engine, Cloud Function or Cloud Run) then the credentials are extracted from the service account associated with the GCP service.
2. If the `GOOGLE_APPLICATION_CREDENTIALS` environment variable exists, its value is supposed to be the path to a service account JSON key file on the hosting machine.
3. If the `~/.config/gcloud/application_default_credentials.json` file exists, then the credentials it contains are used (more about setting that file up below).

When developing on your local environment, use either #2 or #3. #3 is equivalent to being invited by the SysAdmin to the project and granted specific privileges. To set up `~/.config/gcloud/application_default_credentials.json`, follow those steps:

- Make sure you have a Google account that can access both the GCP project and the resources you need on GCP. 
- Install the `GCloud CLI` on your environment.
- Execute the following commands:
	```
	gcloud auth login
	gcloud config set project <YOUR_GCP_PROJECT_HERE>
	gcloud auth application-default login
	```
	The first command logs you in. The second command sets the `<YOUR_GCP_PROJECT_HERE>` as your default project. Finally, the third command creates a new `~/.config/gcloud/application_default_credentials.json` file with the credentials you need for the `<YOUR_GCP_PROJECT_HERE>` project.

### Using a `service-account.json`

We assume that you have created a Service Account in your Google Cloud Account (using IAM) and that you've downloaded a `service-account.json` (the name of the file does not matter as long as it is a valid json file). The first way to create a client is to provide the path to that `service-account.json` as shown in the following example:

```js
const { join } = require('path')
const { client } = require('google-cloud-tasks')

// There is only one queue per App Engine service. If you have multiple App Engine microservices,
// you have to create a queue per service.
const queue = client.new({
	name: 'your-queue-name', // Required. This is the Google Cloud Task that points to a specific App Engine Service.
	method: 'POST',		 // Optional. Default 'GET'
	headers: {		 // Optional. Default {}
		Accept: 'application/json'
	},
	jsonKeyFile: join(__dirname, './service-account.json')	// Required
})
```

### Using explicit credentials

This method is similar to the previous one. You should have dowloaded a `service-account.json`, but instead of providing its path, you provide some of its details explicitly:

```js
const { client } = require('google-cloud-tasks')

// There is only one queue per App Engine service. If you have multiple App Engine microservices,
// you have to create a queue per service.
const queue = client.new({
	name: 'your-queue-name', // Required. This is the Google Cloud Task that points to a specific App Engine Service.
	method: 'POST',		 // Optional. Default 'GET'
	headers: {		 // Optional. Default {}
		Accept: 'application/json'
	},
	credentials: {
		client_email:'something-1234@your-project-id.iam.gserviceaccount.com', 
		private_key: '-----BEGIN PRIVATE KEY-----\n123456789-----END PRIVATE KEY-----\n'
	}
})
```

### Using environment variables

```js
const { client } = require('google-cloud-tasks')

// There is only one queue per App Engine service. If you have multiple App Engine microservices,
// you have to create a queue per service.
const queue = client.new({
	name: 'your-queue-name', // Required. This is the Google Cloud Task that points to a specific App Engine Service.
	method: 'POST',		 // Optional. Default 'GET'
	headers: {		 // Optional. Default {}
		Accept: 'application/json'
	}
})
```

The above will only work if all the following environment variables are set:
- `GOOGLE_CLOUD_TASK_PROJECT_ID` or `GOOGLE_CLOUD_PROJECT_ID`
- `GOOGLE_CLOUD_TASK_REGION` or `GOOGLE_CLOUD_REGION`
- `GOOGLE_CLOUD_TASK_CLIENT_EMAIL` or `GOOGLE_CLOUD_CLIENT_EMAIL`
- `GOOGLE_CLOUD_TASK_PRIVATE_KEY` or `GOOGLE_CLOUD_PRIVATE_KEY`

> WARNING: If you're using [NPM's `dotenv`](https://www.npmjs.com/package/dotenv), wrap your PRIVATE_KEY between double-quotes, otherwise some characters are escaped which corrupts the key.

Refer to the next section to see how to pass an OAuth2 token.


## How To Test Locally

Because the task queue is nothing but a queue sitting in front of a real web server, there is very little difference between sending messages to the queue or directly to the underlying HTTP endpoint. The only real difference is that hitting the underlying HTTP endpoint will be immediate instead of being scheduled by the queue. Being able to bypass the queue is usually useful during the design or testing phase. Here is an example on how you can send messages directly to the underlying HTTP endpoint:

```js
const queue = client.new({
	name: 'your-queue-name',								// Required
	jsonKeyFile: join(__dirname, './service-account.json'),
	byPassConfig: {
		service: 'http://localhost:4000'
	}
})

const task_01 = {  
	name: 'task #1', 
	otherData: {
		age: 23
	} 
}

// Sending a single task using a 'POST' to 'http://localhost:4000/pathname-01' bypassing the queue 'your-queue-name'.
queue.task('pathname-01').send(task_01)
	.then(({ status, data }) => console.log({ status, data }))
```

## Other Utilities
### Listing all the pending tasks
> WARNING: Only scan up to 30,000 tasks. If there are more, these APIs will return incomplete results.

List all tasks for that queue
```js
queue.task().list().then(tasks => console.log(tasks))
```

Only list the tasks for the specific pathname 'pathname-01' in that queue
```js
queue.task('pathname-01').list().then(tasks => console.log(tasks))
```

### Finding a specific task
> WARNING: Only scan up to 30,000 tasks. If there are more, these APIs will return incomplete results.

Return the first task that matches the task predicate (a task contains the following property: `id`, `method`, `pathname`, `schedule` and `created`)
```js
queue.task().find(({ id }) => /^123/.test(id)).then(task => console.log(task))
```

Does the same as above, but only for tasks with a pathname equal to 'pathname-01'
```js
queue.task('pathname-01').find(({ id }) => /^123/.test(id)).then(task => console.log(task))
```

### Testing if a task exists
> WARNING: Only scan up to 30,000 tasks. If there are more, these APIs will return incomplete results.

Return the first task that matches the task predicate (a task contains the following property: `id`, `method`, `pathname`, `schedule` and `created`)
```js
queue.task().some(({ id }) => /^123/.test(id)).then(yes => console.log(yes))
```

Does the same as above, but only for tasks with a pathname equal to 'pathname-01'
```js
queue.task('pathname-01').some(({ id }) => /^123/.test(id)).then(yes => console.log(yes))
```

### Testing if an http request is from Cloud Task Or CRON

```js
const { utils: { isTaskRequest, isCronRequest } } = require('google-cloud-tasks')

app.get('/', (req,res) => {
	const message = 
		isTaskRequest(req) ? `I'm a Cloud Task request` : 
		isCronRequest(req) ? `I'm a CRON request` : `I'm a standard request` 

	res.status(200).send(message)
})
```

> Note: Both `isTaskRequest` and `isCronRequest` accept either a request (e.g., { headers: { ... } }) object or a headers object (e.g., { ... }).
The way those 2 methods work is straighforward. They look for the existence of those 2 headers in the request: `'x-appengine-queuename'` and `'x-appengine-taskname'`. If those 2 headers are both present, the request is either a CRON or a Cloud Task request. A CRON request is one with a `'x-appengine-queuename'`	 equal to `'__cron'`.

### Formatting a Task ID

A Task ID is an optional argument that can be passed when pushing a task to the queue. It helps to make sure that the task is only pushed once. That task ID only accept the following characters: a-z, A-Z, 0-9, - and _ 

To facilitate generating those IDs, we provide the following utility:

```js
const { utils: { formatTaskId } } = require('google-cloud-tasks')

const taskId = formatTaskId(`You can type anything here %&532vj% @V~`)
```

## Minimizing Network Errors

Networks errors (e.g. socket hang up, connect ECONNREFUSED) are a fact of life. To deal with those undeterministic errors, this library uses a simple exponential back off retry strategy, which will reprocess your read or write request for 10 seconds by default. You can increase that retry period as follow:

```js
queue.task('pathname-01').send(task_01, { timeout: 30000 })

queue.task().list({ timeout: 30000 })

queue.task('pathname-01').find(({ id }) => /^123/.test(id), { timeout: 30000 })

queue.task('pathname-01').some(({ id }) => /^123/.test(id), { timeout: 30000 })
```

# This Is What We re Up To
We are Neap, an Australian Technology consultancy powering the startup ecosystem in Sydney. We simply love building Tech and also meeting new people, so don't hesitate to connect with us at [https://neap.co](https://neap.co).

Our other open-sourced projects:
#### GraphQL
* [__*graphql-serverless*__](https://github.com/nicolasdao/graphql-serverless): GraphQL (incl. a GraphiQL interface) middleware for [webfunc](https://github.com/nicolasdao/webfunc).
* [__*schemaglue*__](https://github.com/nicolasdao/schemaglue): Naturally breaks down your monolithic graphql schema into bits and pieces and then glue them back together.
* [__*graphql-s2s*__](https://github.com/nicolasdao/graphql-s2s): Add GraphQL Schema support for type inheritance, generic typing, metadata decoration. Transpile the enriched GraphQL string schema into the standard string schema understood by graphql.js and the Apollo server client.
* [__*graphql-authorize*__](https://github.com/nicolasdao/graphql-authorize.git): Authorization middleware for [graphql-serverless](https://github.com/nicolasdao/graphql-serverless). Add inline authorization straight into your GraphQl schema to restrict access to certain fields based on your user's rights.

#### React & React Native
* [__*react-native-game-engine*__](https://github.com/bberak/react-native-game-engine): A lightweight game engine for react native.
* [__*react-native-game-engine-handbook*__](https://github.com/bberak/react-native-game-engine-handbook): A React Native app showcasing some examples using react-native-game-engine.

#### Tools
* [__*aws-cloudwatch-logger*__](https://github.com/nicolasdao/aws-cloudwatch-logger): Promise based logger for AWS CloudWatch LogStream.

# Annexes
## Available Regions

As of today (June 2019), Google Cloud Tasks API is in beta. That means that not all locations are available. Make sure that your App Engine is running in one of the following location:

	- asia-south1 (Mumbai)
	- asia-southeast1 (Singapore)
	- asia-east2 (Hong Kong)
	- asia-northeast1 (Tokyo)
	- asia-northeast2 (Osaka)
	- australia-southeast1 (Australia - Sydney)
	- europe-west1 (Belgium)
	- europe-west2 (London)
	- europe-west3 (Frankfurt)
	- europe-west6 (Zurich)
	- us-west2 (Los Angeles)
	- us-central1 (Iowa)
	- us-east1 (South Carolina)
	- us-east4 (Northern Virginia)
	- northamerica-northeast1 (Montreal)
	- southamerica-east1 (Sao Paulo)

# License
Copyright (c) 2018, Neap Pty Ltd.
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
* Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
* Neither the name of Neap Pty Ltd nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL NEAP PTY LTD BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

<p align="center"><a href="https://neap.co" target="_blank"><img src="https://neap.co/img/neap_color_horizontal.png" alt="Neap Pty Ltd logo" title="Neap" height="89" width="200"/></a></p>
