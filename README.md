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
const createClient = require('google-cloud-tasks')

const client = createClient({
	queue: 'your-queue-name',
	method: 'POST',
	pathname: '/',
	jsonKeyFile: join(__dirname, './service-account.json')
})

const createArray = (size=0) => Array.apply(null, Array(size))

// Push a single task to the queue
const task_01 = { 
	body: { 
		name: 'task #1', 
		otherData: {} 
	} 
}

client.push(task_01).then(res => console.log(res))

// Push a 100 tasks to the queue
const batchOfTasks = createArray(100).map((x,id) => ({ 
	body: {
		id,  
		name: `task #${id}`,
		otherData: {}
	}
}))

client.batch(batchOfTasks).then(res => console.log(res))
```

### Intermediate Examples
#### #1. Override The Default Client Config

The following example overrides the default `'POST'` method and `'/'` pathname:

```js
const task_02 = { 
	method: 'GET',
	pathname: '/?message=hello'
	body: { 
		name: 'task #1', 
		otherData: {} 
	} 
}

client.push(task_02).then(res => console.log(res))
```

#### #2. Add Custom Headers

The following example overrides the default `'POST'` method and `'/'` pathname:

```js
const task_02 = { 
	method: 'GET',
	pathname: '/?message=hello',
	headers: {
		hello: 'world'
	},
	body: { 
		name: 'task #1', 
		otherData: {} 
	} 
}

client.push(task_02).then(res => console.log(res))
```

#### #3. Execute Later

The following example shows how to schedule a task for a later execution:

```js
const addMinutesToDate = (d, v=0) => {
	const t = new Date(d)
	t.setMinutes(d.getMinutes() + v)
	return t
}

const task_04 = { 
	method: 'GET',
	pathname: '/?message=hello'
	schedule: addMinutesToDate(new Date(), 1).toISOString(),
	body: { 
		name: 'task #1', 
		otherData: {} 
	} 
}

client.push(task_04).then(res => console.log(res))
```

#### #4. Execute Only Once

The following example shows how to execute a task only once:

```js
const task_05 = { 
	id: 1,
	method: 'GET',
	pathname: '/?message=hello'
	body: { 
		name: 'task #1', 
		otherData: {} 
	} 
}

client.push(task_05).then(res => console.log(res))
client.push(task_05).then(res => console.log(res))
```

The second push will return an HTTP response (not throw an exception) similar to this:

```js
{
 "status": 409,
 "data": {
  "error": {
   "code": 409,
   "message": "Requested entity already exists",
   "status": "ALREADY_EXISTS"
  }
 }
}
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
