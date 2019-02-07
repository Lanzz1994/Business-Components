<template>
    <div class="lz-sider-table">
        <div class="lz-sider-conditions">
          <template v-for="(con,index) in conditions">
            <span v-if="con.type==='input'" :key="index" class="condition">
              <span class="condition-title">{{con.label}} : </span>
              <el-input size="small" v-model="conditionVals[con.field]" placeholder="请输入" v-bind="con.props"></el-input>
            </span>
            <span v-if="con.type==='select'" :key="index" class="condition">
              <span class="condition-title">{{con.label}} : </span>
              <el-select size="small" v-model="conditionVals[con.field]" popper-class="lz-sider-conditions condition-select" v-bind="con.props">
                <el-option v-for="(opt,optIndex) in con.options||[]" :key="optIndex" v-bind="opt"></el-option>
              </el-select>
            </span>
            <span v-if="con.type==='timerange'" :key="index" class="condition">
              <span class="condition-title">{{con.label}} : </span>
              <el-date-picker type="daterange" size="small" start-placeholder="开始时间" end-placeholder="结束时间" range-separator="-" v-model="conditionVals[con.field]" v-bind="con.props"></el-date-picker>
            </span>
          </template>
          <span title="搜索" @click="search"><i class="el-icon-search"></i></span>
        </div>
        <el-table :data="data" size="mini" border v-bind="tableProps">
            <template v-for="(col,index) in columns">
                <el-table-column v-if="col.html" :key="index" v-bind="col">
                    <template slot-scope="scope">
                        <div v-html="col.html(scope.row)"></div>
                    </template>
                </el-table-column>
                <el-table-column v-else :key="index" v-bind="col"></el-table-column>
            </template>
        </el-table>
        <div class="footer">
          <el-pagination small layout="prev, pager, next, jumper" 
            :current-page="pageIndex" :page-size="pageSize" :total="pageTotal"
            @current-change="handleCurrentChange"
          >
          </el-pagination>
        </div>
    </div>
</template>

<script>
export default {
    props:{
        conditions:{
          type:Array,
          default:function(){return []}
        },
        columns:{
            type:Array,
            default:function(){return []}
        },
        data:{
            type:Array,
            default:function(){return []}
        },
        tableProps:{}
    },
    data:function({conditions}){
      let conditionVals={};
      conditions.map(function(v){
        conditionVals[v.field]=undefined;  
      })
      return {
        conditionVals,
        pageIndex:1,
        pageSize:7,
        pageTotal:0
      }
    },
    methods:{
      search:function(){
        new Promise((resolve,reject)=>{
          let conds={...this.conditionVals};
          this.conditions.filter(v=>v.type==='timerange').map(v=>{
            let btime=v.field+'_btime',etime=v.field+'_etime';
            if(conds[v.field]&&conds[v.field].length>0){
              conds[btime]=conds[v.field][0].Format('yyyy-MM-dd hh:mm:ss');
              conds[etime]=conds[v.field][1].Format('yyyy-MM-dd hh:mm:ss');
            }else{
              conds[btime]='';
              conds[etime]='';
            }
          });
          this.$emit('search',{...conds,pageIndex:this.pageIndex,pageSize:this.pageSize},resolve,reject);
        }).then((response)=>{
          this.pageTotal=response;
        }).catch(()=>{
          this.$message.warning('获取数据异常');
        });
      },
      handleCurrentChange:function(index){
        this.pageIndex=index;
        this.search();
      }
    }
}
</script>

<style>
.lz-sider-table .footer{
  text-align: center;
  padding-top:8px;
}
</style>
