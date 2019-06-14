<template>
  <div>
    <label>
      基金代码：
      <input type="text" v-model="addValue" @keyup.enter="add">
    </label>
    <button @click="add">添加</button>
    <ul>
      <li v-for="(code) in fundCodes" :key="code">{{code}}<button @click="remove(code)">删除</button></li>
    </ul>
  </div>
</template>

<script>
  export default {
    name: "Options",
    data () {
      return {
        KEY_FUND_CODES: 'fundCodes',
        addValue: '',
        fundCodes: []
      }
    },
    methods: {
      add () {
        // 验证输入基金代码
        if (!/^\d{6}$/.test(this.addValue)) {
          this.addValue = ''
          return;
        }
        browser.storage.local.get(this.KEY_FUND_CODES).then(stor => {
          const { fundCodes } = stor
          fundCodes.push(this.addValue)
          this.addValue = ''
          browser.storage.local.set({
            fundCodes: fundCodes
          }).then(() => {
            // 刷新列表
            this.fundCodes = fundCodes
            console.debug('after added %o', this.fundCodes)
          })
        })
      },
      remove (code) {
        browser.storage.local.get(this.KEY_FUND_CODES).then(stor => {
          const { fundCodes } = stor
          fundCodes.splice(fundCodes.indexOf(code), 1)
          browser.storage.local.set({
            fundCodes: fundCodes
          }).then(() => {
            // 刷新列表
            this.fundCodes = fundCodes
            console.debug('after removed %o', this.fundCodes)
          })
        })
      }
    },
    created() {
      browser.storage.local.get(this.KEY_FUND_CODES).then(stor => {
        const { fundCodes } = stor
        if (fundCodes == null || !(fundCodes instanceof Array)) {
          browser.storage.local.set({fundCodes: this.fundCodes}).then(() => {
            console.debug("Init storage finished")
          })
        } else {
          this.fundCodes = fundCodes
        }
      })
    }
  }
</script>

<style scoped>
.invalid-input {
  border: 1px solid red;
}
</style>