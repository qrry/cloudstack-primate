// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

export default {
  name: 'appManager',
  title: '应用管理',
  icon: 'appstore',
  permission: ['listAppManage'],
  columns: ['state', 'app_store_name', 'description', 'runScript', 'owner', 'created', 'last_updated', 'operation'],
  details: ['应用状态', '应用名称', '应用管理描述', '运行脚本', '创建人', '创建时间', '更新时间', '操作'],
  related: [{
    name: 'cluster',
    title: 'label.clusters',
    param: 'podid'
  }, {
    name: 'host',
    title: 'label.hosts',
    param: 'podid'
  }],
  tabs: [{
    name: 'details',
    component: () => import('@/components/view/DetailsTab.vue')
  }, {
    name: 'resources',
    component: () => import('@/views/infra/Resources.vue')
  }],
  hideSearchBox: true,
  actions: [
    {
      api: 'createAppManage',
      icon: 'plus',
      label: '为实例添加应用',
      docHelp: 'installguide/configuration.html#adding-a-pod',
      listView: true,
      popup: true,
      component: () => import('@/views/control/AppStoreManageAdd.vue')
    },
    {
      key: 'update',
      api: 'updatePod',
      icon: 'edit',
      label: 'label.edit',
      dataView: true,
      args: ['name', 'netmask', 'gateway'],
      component: () => import('@/views/control/AppStoreManageAdd.vue')
    },
    {
      api: 'updatePod',
      icon: 'play-circle',
      label: 'label.action.enable.pod',
      message: 'message.action.enable.pod',
      docHelp: 'adminguide/hosts.html#disabling-and-enabling-zones-pods-and-clusters',
      dataView: true,
      show: (record) => { return record.allocationstate === 'Disabled' },
      args: ['allocationstate'],
      mapping: {
        allocationstate: {
          value: (record) => 'Enabled'
        }
      }
    },
    {
      api: 'updatePod',
      icon: 'pause-circle',
      label: 'label.action.disable.pod',
      message: 'message.action.disable.pod',
      docHelp: 'adminguide/hosts.html#disabling-and-enabling-zones-pods-and-clusters',
      dataView: true,
      show: (record) => { return record.allocationstate === 'Enabled' },
      args: ['allocationstate'],
      mapping: {
        allocationstate: {
          value: (record) => 'Disabled'
        }
      }
    },
    {
      api: 'startRollingMaintenance',
      icon: 'setting',
      label: 'label.start.rolling.maintenance',
      message: 'label.start.rolling.maintenance',
      dataView: true,
      args: ['timeout', 'payload', 'forced', 'podids'],
      mapping: {
        podids: {
          value: (record) => { return record.id }
        }
      }
    },
    {
      key: 'delete',
      api: 'deleteAppManage',
      icon: 'delete',
      label: 'label.action.delete.pod',
      message: 'message.action.delete.pod',
      dataView: true,
      args: ['id']
    }
  ]
}