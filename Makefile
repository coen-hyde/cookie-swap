test: 
	@NODE_ENV=test ./node_modules/.bin/mocha test/index.js

.PHONY: test
