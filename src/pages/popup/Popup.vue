<template>
  <div>
    <div v-if="!fundCodes || fundCodes.length === 0">还未添加基金代码，请到配置页添加</div>
    <div v-else>
      <button @click="refresh">刷新</button>
      <ul v-if="fundsInfo != null">
        <li v-for="info in fundsInfo" :key="info.code">
          <div>{{info.name}}</div>
          <div>更新时间：{{info.updateTime}}</div>
          <div>净值估算：<span :style="{color: info.estNetPst.charAt(0) === '-' ? 'green' : 'red'}">{{info.estNetVal}}</span></div>
          <div>估算变化：<span :style="{color: info.estNetPst.charAt(0) === '-' ? 'green' : 'red'}">{{info.estNetDlt}}</span></div>
          <div>估算变化(%)：<span :style="{color: info.estNetPst.charAt(0) === '-' ? 'green' : 'red'}">{{info.estNetPst}}</span></div>
          <div>单位净值：<span :style="{color: info.unitNetPst.charAt(0) === '-' ? 'green' : 'red'}">{{info.unitNetVal}}</span></div>
          <div>单位变化(%)：<span :style="{color: info.unitNetPst.charAt(0) === '-' ? 'green' : 'red'}">{{info.unitNetPst}}</span></div>
          <div>累计净值：{{info.accuNetVal}}</div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  import Big from 'big.js'

  export default {
    name: "Popup",
    data () {
      return {
        urlTmplPage: 'http://fund.eastmoney.com/{code}.html',
        urlTmplEstVal: 'http://fundgz.1234567.com.cn/js/{code}.js',
        fundCodes: [],
        fundsInfo: []
      }
    },
    methods: {
      fetchInfo (fundCode) {
        const prms = [
          fetch(this.urlTmplPage.replace('{code}', fundCode), { mode: 'cors' }),
          fetch(this.urlTmplEstVal.replace('{code}', fundCode), { mode: 'cors' })
        ]
        return Promise.all(prms).then(resps => {
          return Promise.all([resps[0].text(), resps[1].text()])
        }).then(resps => {
          const [html, realTimeTxt] = resps
          const realTime = JSON.parse(realTimeTxt.replace('jsonpgz(', '').replace(');', ''))
          const parser = new DOMParser()
          const htmlDoc = parser.parseFromString(html, 'text/html')
          const divDataOfFund = htmlDoc.querySelector('.dataOfFund')
          const estVal = new Big(realTime.gsz)
          const unitNetVal = new Big(realTime.dwjz)
          return {
            code: fundCode,
            name: `${realTime.name}(${realTime.fundcode})`,
            updateTime: realTime.gztime,
            estNetVal: realTime.gsz,
            estNetDlt: estVal.minus(unitNetVal),
            estNetPst: realTime.gszzl,
            unitNetVal: realTime.dwjz,
            unitNetPst: divDataOfFund.querySelector('.dataItem02 .dataNums .ui-font-middle').innerHTML,
            accuNetVal: divDataOfFund.querySelector('.dataItem03 .dataNums span').innerHTML
          }
        }).catch(e => {
          console.error(e)
          return null
        })
      },
      refresh () {
        browser.storage.local.get(this.KEY_FUND_CODES).then(stor => {
          const { fundCodes } = stor
          if (fundCodes != null && fundCodes instanceof Array) {
            this.fundCodes = fundCodes
            const infoPrms = this.fundCodes.map(fundCode => this.fetchInfo(fundCode))
            Promise.all(infoPrms).then(resps => {
              this.fundsInfo = resps
            })
          }
        })
      }
    },
    created () {
      this.refresh()
    }
  }
</script>

<style scoped>

</style>