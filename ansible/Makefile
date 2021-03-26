run:
	ansible-playbook provision-jenkins.yml

install:
	ansible-galaxy install -r requirements.yml

move_backup:
	ansible-playbook jenkins-backup.yml -i inventory/hosts_source -e "ACTION=download"
	ansible-playbook jenkins-backup.yml -i inventory/hosts_dest -e "ACTION=upload"
