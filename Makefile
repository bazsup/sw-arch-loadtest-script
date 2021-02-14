test:
	k6 run short_link_test.js

example:
	HOSTNAME=localhost:3000 k6 run short_link_test.js