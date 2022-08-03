# SocioBoard Docker Ansible Deploy
Automated setup of SocioBoard Docker using Ansible.

NOTE:
- The ansible roles here will perform the basic setup, update and uninstall tasks.
- Currently only amd64 is supported. The base container is alpine which can be built for arm. However npm will throw errors and although I may in the future, I have not looked into the issue further.
- Set the location of the ssh key which has access to your destination server in `ansible/ansible.cfg`

## Supported Operating Systems
The ansible roles were designed to install socioboard on the following operating systems:
- RedHat Enterprise Linux(RHEL) & forks(Alma, Rocky)
- Debian & Debian based systems(Debian, Ubuntu etc.) (Untested)

If you would like support for another OS, let me know and I will try to add it.

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
Run the playbook with `setup-all` tag to do a full deployment
```bash
cd ansible
ansible-playbook -b -K socioboard-deploy.yml --tags=setup-all
```

Run the playbook with `setup` tag to do a basic deployment(you need to run with `setup-all` at least once, this tag does not build the SocioBoard Docker image. Use this if you want redeploy after using the `remove` tag documented below)
```bash
cd ansible
ansible-playbook -b -K socioboard-deploy.yml --tags=setup
```

## Uninstalling
Run the playbook with `remove` tag to remove only the containers and networks(data is not touched)
```bash
cd ansible
ansible-playbook -b -K socioboard-deploy.yml --tags=remove
```

Run the playbook with `remove-all` tag to remove everything(including data)
```bash
cd ansible
ansible-playbook -b -K socioboard-deploy.yml --tags=remove-all
```

## Updating
Run the playbook with `update` tag to run a full update(data is not touched)
```bash
cd ansible
ansible-playbook -b -K socioboard-deploy.yml --tags=update
```
