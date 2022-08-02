# SocioBoard Docker Ansible Deploy
Automated setup of SocioBoard Docker using Ansible.

NOTE:
- The ansible roles here will perform the basic setup for you. There are no uninstall roles yet, the roles are very basic and will be added to in time.
- Currently only amd64 is supported. The base container is alpine which can be built for arm. However npm will throw errors and although I may in the future, I have not looked into the issue further.
- Set the location of the ssh key which has access to your destination server in `ansible/ansible.cfg`

## Supported Operating Systems
The ansible roles were designed to install socioboard on the following operating systems:
- RedHat Enterprise Linux(RHEL)
- RHEL Forks(Alma, Rocky)

Support for other systems will be added at a later stage.

## Preparing for Installation
Copy the inventory template and make changes:
```bash
cp ansible/inventory-template.yml ansible/inventory.yml
vi ansible/inventory.yml
```

Copy the config template and make changes:
```bash
cp ansible/vars/config-template.yml ansible/vars/config.yml
vi ansible/vars/config.yml
```

Copy the Docker .env template and make changes:
```bash
cp docker/.env.example ansible/roles/socio-env/files/docker.env
vi ansible/roles/socio-env/files/docker.env
```

## Installing
Run the playbook to deploy
```bash
cd ansible
ansible-playbook -b -K socioboard-deploy.yml
```
