<template>
  <div
    v-bind:class="['lz-sider map-ctrl-box animate',position,{'lz-sider-hidden':!inShow}]"
    v-bind:style="{width:width,
            right:position==='right'?moveDistance:'unset',
            left:position==='left'?moveDistance:'unset',
            top:top,bottom:bottom}"
  >
    <div
      class="lz-sider-extends"
      v-bind:style="{width:branchWidth+'px',
                left:position==='right'?-branchWidth+'px':'unset',
                right:position==='left'?-branchWidth+'px':'unset'}">
      <div class="lz-sider-active-btn" @click="togglePanel">
        <i v-bind:class="['el-icon-d-arrow-right animate',inShow?'':'reserve']" style="cursor:pointer"></i>
      </div>
    </div>
    <div v-bind:class="['lz-sider-fixed',obliqueHorn?'oblique-horn':'']">
      <slot name="sider-fixed"></slot>
    </div>
  </div>
</template>
<script>
//用到的ElementUI控件列表
//el-input

export default {
  name: "LzSider",
  componentName: "LzSilder",
  props: {
    width: String,
    top: {
      type: String,
      default: "0"
    },
    bottom: String,
    position: {
      type: String,
      default: "right"
    },
    obliqueHorn:{
      type:Boolean,
      default:false
    }
  },
  data: function() {
    return {
      //吸附分支容器设定
      branchWidth: 36,
      inShow:true
    };
  },
  computed: {
    moveDistance: function() {
      return this.inShow ? "0" : -this.$el.clientWidth + "px";
    }
  },
  methods: {
    togglePanel: function() {
      this.inShow = !this.inShow;
    }
  }
};
</script>

<style type="text/css">
.lz-sider {
  right: 0px;
  top: 0;
  z-index:502!important;
  /* overflow-y:auto; */
}

.lz-sider-extends {
  position: absolute;
  top: 0;
  left: -80px;
  background-color: transparent;
}

/*激活面板按钮*/
.lz-sider-active-btn {
  width: 100%;
  height: 50px;
  line-height: 50px;
  text-align: center;
  color: #41f6f1;
  font-size: 23px;
  background-color: #053B47;
  cursor: pointer;
}

.left .lz-sider-active-btn {
  clip-path: polygon(0 0,65% 0,100% 25%,100% 75%,65% 100%,0 100%);
}
.right .lz-sider-active-btn{
  clip-path: polygon(0 25%,35% 0,100% 0,100% 100%,35% 100%,0 75%);
}

.lz-sider.left .el-icon-d-arrow-right {
  transform: rotate(180deg);
}
.lz-sider.left .el-icon-d-arrow-right.reserve {
  transform: rotate(0);
}

.lz-sider.right .el-icon-d-arrow-right.reserve {
  transform: rotate(180deg);
}

.lz-sider-fixed{
  background-image: linear-gradient(0deg, #162831 0%, #0c323d 29%,	#023c48 75%);
}
.lz-sider.left .lz-sider-fixed.oblique-horn{
  border-right: solid 1px #026075;
  clip-path: polygon(0 0,100% 0,100% calc(100% - 13px),calc(100% - 13px) 100%,0 100%);
}
.lz-sider.right .lz-sider-fixed.oblique-horn{
  border-left: solid 1px #026075;
  clip-path: polygon(0 0,100% 0,100% 100%,13px 100%,0 calc(100% - 13px));
}

</style>