test:
	k6 run http_post.js

example:
	HOSTNAME=test.k6.io k6 run http_post.js