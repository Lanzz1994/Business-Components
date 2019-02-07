<template>
    <div class="lz-sider-chart">
        <div class="lz-sider-conditions">
          <span class="condition">
            <span class="condition-title">时间 : </span>
            <el-date-picker type="daterange" size="small" start-placeholder="开始时间" end-placeholder="结束时间" range-separator="-" v-model="times"></el-date-picker>
          </span>
        </div>
        <div class="chart">
            <div :id="chartId" class="chart-conatiner"></div>
        </div>
    </div>
</template>

<script>
export default {
    props:{
      chartId:{
        type:String,
        //required:true
      },
      chartOpts:{
        type:{},
        //required:true
      }
    },
    data:function(){
      return {
        chart:null,
        times:[]
      }
    },
    methods:{
      search:function(){
        new Promise((resolve,reject)=>{
          this.$emit('search',{},resolve,reject);
        }).then((response)=>{
          this.pageTotal=response;
        }).catch(()=>{
          this.$message.warning('获取数据异常');
        });
      },
      setChart:function(){
        this.chart.setOption({
          tooltip: {
        trigger: 'item',
        formatter: "{a} <br/>{b}: {c} ({d}%)"
    },
    series: [
        {
            name:'访问来源',
            type:'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
                normal: {
                    show: true,
                },
                emphasis: {
                    show: true,
                    textStyle: {
                        fontSize: '30',
                        fontWeight: 'bold'
                    }
                }
            },
            labelLine: {
                normal: {
                    show: true
                }
            },
            data:[
                {value:335, name:'直接访问'},
                {value:310, name:'邮件营销'},
                {value:234, name:'联盟广告'},
                {value:135, name:'视频广告'},
                {value:1548, name:'搜索引擎'}
            ]
        }
    ]
        });
      }
    },
    mounted:function(){
      this.chart = this.$echarts.init(document.getElementById(this.chartId));
      this.setChart();
    }
}
</script>

<style>
  .lz-sider-chart{
    padding:10px;
  }
  .chart-conatiner{
    width:498px;
    height:220px;

  }
</style>
