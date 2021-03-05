UNIQUE := $(shell date '+%H:%m:%S')

test:
	k6 run short_link_test.js

test_visit:
	UNIQUE=${UNIQUE} k6 run link_visit_test.js

example:
	HOSTNAME=localhost:3000 k6 run short_link_test.js

example_visit:
	UNIQUE=${UNIQUE} HOSTNAME=localhost:3000 k6 run link_visit_test.js

example-export:
	HOSTNAME=localhost:3000 k6 run short_link_test.js --out json=test_result.json --summary-export=export.json
