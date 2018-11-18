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
const { validate } = require('../utils')

describe('utils', () => {
	describe('validate', () => {
		describe('#url', () => {
			it('01 - Should invalidate bad URL.', () => {
				assert.isNotOk(validate.url('localhost'), '01')
				assert.isNotOk(validate.url('/localhost'), '02')
			})
			it('02 - Should validate good URL.', () => {
				assert.isOk(validate.url('https://neap.co'), '01')
			})
			it('03 - Should support localhost.', () => {
				assert.isOk(validate.url('http://localhost:4000'), '01')
				assert.isOk(validate.url('http://localhost'), '02')
				assert.isNotOk(validate.url('http://localhost:w23'), '03')
			})
			it('04 - Should support IPv4s.', () => {
				assert.isOk(validate.url('http://127.0.0.1:4000'), '01')
				assert.isOk(validate.url('http://127.0.0.1'), '02')
			})
			it('05 - Should support IPv6s.', () => {
				assert.isOk(validate.url('http://2001:0db8:85a3:0000:0000:8a2e:0370:7334:4000'), '01')
				assert.isOk(validate.url('http://2001:0db8:85a3:0000:0000:8a2e:0370:7334'), '02')
			})
		})
	})
})