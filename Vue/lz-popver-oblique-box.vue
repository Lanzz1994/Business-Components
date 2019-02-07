<template>
  <transition name="fade">
    <div v-if="visible" class="map-ctrl-box popver-oblique-box" style="left:400px;top:200px;">
      <lz-oblique-box>
        <template slot="content">
          <div class="title">临近长航时无人机1<i class="el-icon-close" @click="close"></i></div>
          <div class="split-line"></div>
          <slot name="content"></slot>
        </template>
      </lz-oblique-box>
    </div>
  </transition>
</template>
<script>
import LzObliqueBox from './lz-oblique-box.vue';

export default {
  name: 'LzPopverObliqueBox',
  componentName: 'LzPopverObliqueBox',
  components:{
    LzObliqueBox
  },
  data() {
      return{};
  },
  props: {
      visible:{
        type:Boolean,
        default:false
      }
  },
  computed: {
  },
  methods: {
    close:function(){
      this.$emit('update:visible',false);
    }
  },
  mounted() {
  }
};
</script>
<style type="text/css">
.popver-oblique-box .lz-oblique-box{
  border:none;
  background-color: rgba(2, 60, 71,.8);
  min-width: 366px;
  min-height: 231px;
  cursor: pointer;
}

.popver-oblique-box .title{
  text-align:center;
  padding:5px;
  font-family: MicrosoftYaHei;
	font-size: 18px;
	font-weight: normal;
	font-stretch: normal;
	line-height: 42px;
	letter-spacing: 0px;
	color: #41f6f1;
}
.popver-oblique-box .el-icon-close{
  position: absolute;
  font-size: 22px;
  right:20px;
  top:15px;
  cursor: pointer;
}
.popver-oblique-box .split-line{
  width:100%;
  height:1px;
  background: linear-gradient(90deg,rgba(0,0,0,0),rgb(80, 252, 244),rgb(255,255,255),rgb(80, 252, 244),rgba(0,0,0,0));
}
</style>