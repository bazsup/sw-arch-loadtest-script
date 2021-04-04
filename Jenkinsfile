pipeline {
    agent any
    parameters {
        string(name: 'HOSTNAME', defaultValue: 'sh.ta.tnpl.me:8080')
    }
    stages {
        stage("set pipeline name") {
            steps {
                script {
                    env.currentBuild.displayName = "#${BUILD_NUMBER} - ${HOSTNAME}"
                }
            }
        }
        stage("run test parallel") {
            parallel {
                stage("test on worker 2 (us-worker)") {
                    agent { label "us-worker" }
                    steps {
                        sh """
                            whoami
                            pwd
                            echo "worker 2" >> temp1.log
                        """
                    }
                }
                stage("test on worker 3 (sg-worker)") {
                    agent { label "sg-worker" }
                    steps {
                        sh """
                            whoami
                            pwd
                            echo "worker 3" >> temp2.log
                        """
                    }
                }
            }
        }
    }
}
