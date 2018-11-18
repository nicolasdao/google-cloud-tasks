# Google Cloud Tasks &middot;  [![NPM](https://img.shields.io/npm/v/google-cloud-tasks.svg?style=flat)](https://www.npmjs.com/package/google-cloud-tasks) [![Tests](https://travis-ci.org/nicolasdao/google-cloud-tasks.svg?branch=master)](https://travis-ci.org/nicolasdao/google-cloud-tasks) [![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause) [![Neap](https://neap.co/img/made_by_neap.svg)](#this-is-what-we-re-up-to)
__*Google Cloud Tasks*__ is node.js package to push tasks to Google Cloud Tasks (beta). It also include pushing tasks in batches.

# Table of Contents

> * [Install](#install) 
> * [How To Use It](#how-to-use-it) 
> * [About Neap](#this-is-what-we-re-up-to)
> * [License](#license)


# Install
```
npm i google-cloud-tasks --save
```

# How To Use It

## Prerequisite

Before using this package, you must first:

1. Have a Google Cloud Account.

2. Have a Project in that Google Account (the next step are specific to that Project). __WARNING__: As of today (Oct 2018), Google Cloud Tasks API is in beta. That means that not all locations are available. Make sure that your App Engine is running in one of the following location:
	- us-central1 (Iowa)
	- us-east1 (South Carolina)
	- europe-west1 (Belgium)
	- asia-northeast1 (Tokyo)

3. Have an App Engine service running.

4. Have a Task Queue configured to push tasks to the App Engine service above.

5. Have a Service Account set up with the following 2 roles:
	- `roles/appengine.appViewer`
	- `roles/cloudtasks.enqueuer`

6. Get the JSON keys file for that Service Account above

7. Save that JSON key into a `service-account.json` file. Make sure it is located under a path that is accessible to your app (the root folder usually).

8. Add a `location_id` property into that `service-account.json` file. That property should contain the location of your App Engine. Because the Google Cloud Tasks API is currently in beta, only the following locations are available (as of Oct 2018):
	- `us-central1`
	- `us-east1`
	- `europe-west1`
	- `asia-northeast1`

## Show Me The Code
### Basic Example

```js
const { join } = require('path')
const { client } = require('google-cloud-tasks')

const queue = client.new({
	name: 'your-queue-name',								// Required
	method: 'POST',             							// Optional. Default 'GET'
	headers: {												// Optional. Default {}
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

// Sending a single task to queue 'your-queue-name' using a 'POST' at the pathname 'service-01'
// with headers 'Accept: application/json'
queue.task('service-01').send(task_01)
	.then(({ status, data }) => console.log({ status, data }))

// Sending multiple tasks to queue 'your-queue-name' using a 'POST' at the pathname 'service-01'
// with headers 'Accept: application/json'
queue.task('service-01').send([task_01, task_02])
	.then(({ status, data, errors }) => console.log({ status, data, errors })) 	// data is an response array for each successfull task sent
																				// errors is an response array for each failed task

// Sending a single task to queue 'your-queue-name' using a 'POST' at the pathname '/'
// with headers 'Accept: application/json'
queue.task().send(task_01)
	.then(({ status, data }) => console.log({ status, data }))

// Sending a single task to queue 'your-queue-name' using a 'POST' at the pathname 'service-01'
// with headers 'Accept: application/json' and 'Authorization: 123'
queue.task('service-01', { headers: { Authorization: '123' } }).send(task_01)
	.then(({ status, data }) => console.log({ status, data }))

// Sending a single task to queue 'your-queue-name' using a 'POST' at the pathname 'service-01'
// with headers 'Accept: application/json', 'Authorization: 123' and 'Custom: some other data'
queue.task('service-01', { headers: { Authorization: '123' } }).send(task_01, { headers: { Custom: 'some other data' } })
	.then(({ status, data }) => console.log({ status, data }))

// Delaying to send a single task to queue 'your-queue-name' using a 'POST' at the pathname 'service-01'
// with headers 'Accept: application/json' and 'Custom: some other data' to the 1st of Feb 2020
queue.task('service-01').send(task_01, { schedule: new Date(2020,1,1), headers: { Custom: 'some other data' }})
	.then(({ status, data }) => console.log({ status, data }))

// Preventing to send the same task more than once to queue 'your-queue-name' using a 'POST' at the pathname 'service-01'
// with headers 'Accept: application/json' and 'Custom: some other data'. This is done by explicitely settin the task id. 
// That id must be unique. The second task will fail because the task with id 1 will already been added.
queue.task('service-01').send(task_01, { id:1, headers: { Custom: 'some other data' }})
	.then(({ status, data }) => console.log({ status, data }))
queue.task('service-01').send(task_01, { id:1, headers: { Custom: 'some other data' }})
	.then(({ status, data }) => console.log({ status, data }))

// Sending a single task to queue 'your-queue-name' using a 'POST' at the pathname 'service-01'
// with headers 'Accept: application/json' and 'Custom: some other data'. Explicitely setting the task id based on the task payload.
// NOTICE: 	In the example, the second argument of the 'send' method is not an object anymore, but a function. This function 
// 			is supposed to return an object.
queue.task('service-01').send(task_01, t => ({ id: t.otherData.age, headers: { Custom: 'some other data' } }))
	.then(({ status, data }) => console.log({ status, data }))
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
