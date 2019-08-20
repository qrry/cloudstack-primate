export default {
  name: 'infra',
  title: 'Infrastructure',
  icon: 'bank',
  permission: [ 'listInfrastructure' ],
  children: [
    {
      name: 'zone',
      title: 'Zones',
      icon: 'table',
      permission: [ 'listZones', 'listZonesMetrics' ],
      component: () => import('@/components/CloudMonkey/Resource.vue'),
      columns: [ 'name', 'allocationstate', 'networktype', 'guestcidraddress' ]
    },
    {
      name: 'pod',
      title: 'Pods',
      icon: 'appstore',
      permission: [ 'listPods' ],
      component: () => import('@/components/CloudMonkey/Resource.vue'),
      columns: [ 'name', 'allocationstate', 'gateway', 'netmask', 'zonename' ]
    },
    {
      name: 'cluster',
      title: 'Clusters',
      icon: 'cluster',
      permission: [ 'listClusters', 'listClustersMetrics' ],
      component: () => import('@/components/CloudMonkey/Resource.vue'),
      columns: [ 'name', 'allocationstate', 'clustertype', 'hypervisortype', 'podname', 'zonename' ]
    },
    {
      name: 'host',
      title: 'Hosts',
      icon: 'desktop',
      permission: [ 'listHosts', 'listHostsMetrics' ],
      params: { 'type': 'routing' },
      component: () => import('@/components/CloudMonkey/Resource.vue'),
      columns: [ 'name', 'state', 'resourcestate', 'ipaddress', 'hypervisor', 'hypervisorversion', 'clustername', 'zonename' ]
    },
    {
      name: 'storagepool',
      title: 'Primary Storages',
      icon: 'database',
      permission: [ 'listStoragePools', 'listStoragePoolsMetrics' ],
      component: () => import('@/components/CloudMonkey/Resource.vue'),
      columns: [ 'name', 'state', 'ipaddress', 'type', 'path', 'scope', 'clustername', 'zonename' ]
    },
    {
      name: 'imagestore',
      title: 'Secondary Storages',
      icon: 'picture',
      permission: [ 'listImageStores' ],
      component: () => import('@/components/CloudMonkey/Resource.vue'),
      columns: [ 'name', 'url', 'protocol', 'scope', 'zonename' ]
    },
    {
      name: 'systemvm',
      title: 'System VMs',
      icon: 'thunderbolt',
      permission: [ 'listSystemVms' ],
      component: () => import('@/components/CloudMonkey/Resource.vue'),
      columns: [ 'name', 'state', 'agentstate', 'systemvmtype', 'publicip', 'privateip', 'hostname', 'zonename' ]
    },
    {
      name: 'router',
      title: 'Virtual Routers',
      icon: 'fork',
      permission: [ 'listRouters' ],
      component: () => import('@/components/CloudMonkey/Resource.vue'),
      columns: [ 'name', 'state', 'publicip', 'guestnetworkname', 'vpcname', 'redundantstate', 'version', 'hostname', 'account', 'zonename', 'requiresupgrade' ]
    },
    {
      name: 'cpusocket',
      title: 'CPU Sockets',
      icon: 'api',
      permission: [ 'listHosts' ],
      params: { 'type': 'routing' },
      component: () => import('@/components/CloudMonkey/Resource.vue'),
      columns: [ 'hypervisor', 'hosts', 'cpusockets' ]
    },
    {
      name: 'managementserver',
      title: 'Management Servers',
      icon: 'rocket',
      permission: [ 'listManagementServers' ],
      component: () => import('@/components/CloudMonkey/Resource.vue'),
      columns: [ 'name', 'state', 'version' ]
    }
  ]
}