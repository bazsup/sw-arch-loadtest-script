pipeline {
    agent any
    options { timestamps() }
    parameters {
        string(name: 'HOSTNAME', defaultValue: 'sh.ta.tnpl.me:8080')
        string(name: 'LOAD_SHORTEN', defaultValue: '100')
        string(name: 'LOAD_VISIT', defaultValue: '500')
    }
    environment {
        GIT_REPO = 'https://github.com/tanapoln/sw-arch-loadtest-script.git'
    }
    stages {
        stage("set pipeline name") {
            steps {
                script {
                    currentBuild.displayName = "#${BUILD_NUMBER} - ${HOSTNAME}"
                }
            }
        }
        stage("run test parallel") {
            steps {
                script {
                    def labels = ["us-worker", "sg-worker"]
                    def builders = [:]
                    for (x in labels) {
                        def label = x
                        builders[label] = {
                            node(label) {
                                git branch: "main", url: GIT_REPO
                                sh "git clean -xdf"
                                sh """
                                    JAVA_OPTS="-Dhostname=${HOSTNAME} -Dload.shorten=${LOAD_SHORTEN} -Dload.visit=${LOAD_VISIT} -Dload.shorten.duration=10 -Dload.visit.duration=10" \
	                                    ./gatling/bin/gatling.sh -s sh.ShortenSimulation -nr
                                    ls
                                """
                                stash includes: '**/*.log', name: "log-${label}"
                            }
                        }
                    }
                    parallel builders
                }
            }
        }
        stage("prepare log files") {
            steps {
                sh """
                    if [ -d 'logs' ]; then rm -r logs; fi
                    mkdir logs
                """
                dir('sg-worker') {
                    unstash "log-sg-worker"
                    sh "find . -name '*.log' -exec mv -v '{}' ../logs/simulation-sg.log \\;"
                    deleteDir()
                }
                dir('us-worker') {
                    unstash "log-us-worker"
                    sh "find . -name '*.log' -exec mv -v '{}' ../logs/simulation-us.log \\;"
                    deleteDir()
                }
                dir('logs') {
                    stash includes: '*.log', name: "gatling-log"
                }
            }
        }
        stage("gatling test") {
            steps {
                git branch: "main", url: GIT_REPO
                sh "git clean -xdf"
                dir('results/short-simulation') {
                    unstash "gatling-log"
                }
                sh """
                    ./gatling/bin/gatling.sh -ro short-simulation
                """
                gatlingArchive()
                // gatlingCheck(metrics: [
                //     'shorten.qps = 100',
                //     'visit.qps = 100',
                //     'global.okRate = 100'
                // ])
            }
        }
    }
}
