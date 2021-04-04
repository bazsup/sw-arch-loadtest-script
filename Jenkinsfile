pipeline {
    agent any
    parameters {
        string(name: 'HOSTNAME', defaultValue: 'sh.ta.tnpl.me:8080')
        string(name: 'LOAD_SHORTEN', defaultValue: '100')
        string(name: 'LOAD_VISIT', defaultValue: '500')
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

                                sh """
                                    echo "worker ${label}" >> temp.log
                                """
                                stash includes: '*.log', name: "log-${label}"
                                cleanWs()
                            }
                        }
                    }
                    parallel builders
                }
            }
        }
        stage("generate report") {
            steps {
                dir('sg-worker') {
                    unstash "log-sg-worker"
                }
                dir('us-worker') {
                    unstash "log-us-worker"
                }
                sh "ls"
            }
        }
    }
}
