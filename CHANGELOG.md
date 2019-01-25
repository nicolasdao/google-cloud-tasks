# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="0.5.6"></a>
## [0.5.6](https://github.com/nicolasdao/google-cloud-tasks/compare/v0.5.5...v0.5.6) (2019-01-25)


### Bug Fixes

* A single failing task prevent all the subsequent others to not be pushed. Dev mode does not support failing is the same task id is pushed more than once ([256d2d0](https://github.com/nicolasdao/google-cloud-tasks/commit/256d2d0))



<a name="0.5.5"></a>
## [0.5.5](https://github.com/nicolasdao/google-cloud-tasks/compare/v0.5.4...v0.5.5) (2019-01-23)


### Bug Fixes

* The Dev mode does not emit request with the 'x-appengine-queuename' and 'x-appengine-taskname' headers, preventing to properly identify those requests as coming from the Task Queue ([48e1daa](https://github.com/nicolasdao/google-cloud-tasks/commit/48e1daa))



<a name="0.5.4"></a>
## [0.5.4](https://github.com/nicolasdao/google-cloud-tasks/compare/v0.5.3...v0.5.4) (2019-01-18)


### Bug Fixes

* options should never be null ([1f2a65c](https://github.com/nicolasdao/google-cloud-tasks/commit/1f2a65c))



<a name="0.5.3"></a>
## [0.5.3](https://github.com/nicolasdao/google-cloud-tasks/compare/v0.5.2...v0.5.3) (2019-01-18)


### Bug Fixes

* Undefined indentity ref in the utils lib ([957bfb8](https://github.com/nicolasdao/google-cloud-tasks/commit/957bfb8))



<a name="0.5.2"></a>
## [0.5.2](https://github.com/nicolasdao/google-cloud-tasks/compare/v0.5.1...v0.5.2) (2019-01-17)


### Features

* Make pushing a task in dev mode not exceed 4 secs ([515bcda](https://github.com/nicolasdao/google-cloud-tasks/commit/515bcda))



<a name="0.5.1"></a>
## [0.5.1](https://github.com/nicolasdao/google-cloud-tasks/compare/v0.5.0...v0.5.1) (2018-12-12)


### Features

* Add support for scheduling task in dev mode ([aeb026f](https://github.com/nicolasdao/google-cloud-tasks/commit/aeb026f))



<a name="0.5.0"></a>
# [0.5.0](https://github.com/nicolasdao/google-cloud-tasks/compare/v0.4.1...v0.5.0) (2018-12-10)


### Features

* Add more robust retry mechanism ([9694a59](https://github.com/nicolasdao/google-cloud-tasks/commit/9694a59))



<a name="0.4.1"></a>
## [0.4.1](https://github.com/nicolasdao/google-cloud-tasks/compare/v0.4.0...v0.4.1) (2018-12-09)


### Features

* Add a random delay when pushing tasks in Dev mode in order to avoid stressing the system too much ([b0cb2c2](https://github.com/nicolasdao/google-cloud-tasks/commit/b0cb2c2))



<a name="0.4.0"></a>
# [0.4.0](https://github.com/nicolasdao/google-cloud-tasks/compare/v0.3.7...v0.4.0) (2018-12-06)


### Features

* Add support for listing pending tasks and testing if pending tasks exists ([d85c5d4](https://github.com/nicolasdao/google-cloud-tasks/commit/d85c5d4))



<a name="0.3.7"></a>
## [0.3.7](https://github.com/nicolasdao/google-cloud-tasks/compare/v0.3.6...v0.3.7) (2018-12-05)



<a name="0.3.6"></a>
## [0.3.6](https://github.com/nicolasdao/google-cloud-tasks/compare/v0.3.5...v0.3.6) (2018-12-05)


### Features

* Add support to detect whether an HTTP request is from a CRON job or a Task Queue ([0230353](https://github.com/nicolasdao/google-cloud-tasks/commit/0230353))



<a name="0.3.5"></a>
## [0.3.5](https://github.com/nicolasdao/google-cloud-tasks/compare/v0.3.4...v0.3.5) (2018-11-25)


### Bug Fixes

* Fetching non-JSON data fails, which forces the retry mechanism to kick off unecessarilly ([7136a44](https://github.com/nicolasdao/google-cloud-tasks/commit/7136a44))



<a name="0.3.4"></a>
## [0.3.4](https://github.com/nicolasdao/google-cloud-tasks/compare/v0.3.3...v0.3.4) (2018-11-22)


### Bug Fixes

* unit test is failing because of wrong UTC format ([d4ea953](https://github.com/nicolasdao/google-cloud-tasks/commit/d4ea953))



<a name="0.3.3"></a>
## [0.3.3](https://github.com/nicolasdao/google-cloud-tasks/compare/v0.3.2...v0.3.3) (2018-11-22)


### Bug Fixes

* unit test is failing because of wrong UTC format ([71dd97d](https://github.com/nicolasdao/google-cloud-tasks/commit/71dd97d))



<a name="0.3.2"></a>
## [0.3.2](https://github.com/nicolasdao/google-cloud-tasks/compare/v0.3.1...v0.3.2) (2018-11-18)


### Bug Fixes

* Validate url throws an exception when using a valid localhost ([6a17954](https://github.com/nicolasdao/google-cloud-tasks/commit/6a17954))



<a name="0.3.1"></a>
## [0.3.1](https://github.com/nicolasdao/google-cloud-tasks/compare/v0.3.0...v0.3.1) (2018-11-18)


### Features

* Add support for bypassing the task queue and sending the message straight to the underlying service ([b384783](https://github.com/nicolasdao/google-cloud-tasks/commit/b384783))



<a name="0.3.0"></a>
# [0.3.0](https://github.com/nicolasdao/google-cloud-tasks/compare/v0.2.1...v0.3.0) (2018-11-18)


### Features

* Add support for new API style ([2cf08df](https://github.com/nicolasdao/google-cloud-tasks/commit/2cf08df))



<a name="0.2.1"></a>
## [0.2.1](https://github.com/nicolasdao/google-cloud-tasks/compare/v0.2.0...v0.2.1) (2018-11-15)



<a name="0.2.0"></a>
# [0.2.0](https://github.com/nicolasdao/google-cloud-tasks/compare/v0.1.0...v0.2.0) (2018-11-15)


### Features

* Throw explicit exception rather silent HTTP code + change client creation API ([3ad3b32](https://github.com/nicolasdao/google-cloud-tasks/commit/3ad3b32))



<a name="0.1.0"></a>
# [0.1.0](https://github.com/nicolasdao/google-cloud-tasks/compare/v0.0.4...v0.1.0) (2018-11-09)


### Features

* Add support for scheduling tasks and overriding the client params ([8192b51](https://github.com/nicolasdao/google-cloud-tasks/commit/8192b51))



<a name="0.0.4"></a>
## [0.0.4](https://github.com/nicolasdao/google-cloud-tasks/compare/v0.0.3...v0.0.4) (2018-10-12)


### Bug Fixes

* Add missing 'collection.batch' function ([68e7806](https://github.com/nicolasdao/google-cloud-tasks/commit/68e7806))



<a name="0.0.3"></a>
## [0.0.3](https://github.com/nicolasdao/google-cloud-tasks/compare/v0.0.2...v0.0.3) (2018-10-12)



<a name="0.0.2"></a>
## [0.0.2](https://github.com/nicolasdao/google-cloud-tasks/compare/v0.0.1...v0.0.2) (2018-10-12)


### Bug Fixes

* Include missing axios package ([504aadb](https://github.com/nicolasdao/google-cloud-tasks/commit/504aadb))



<a name="0.0.1"></a>
## 0.0.1 (2018-10-12)


### Features

* Add a push and batch apu ([831abdf](https://github.com/nicolasdao/google-cloud-tasks/commit/831abdf))
