<template>
    <div v-bind:class="['lz-oblique-box',{'auto-hover':autoHover,'hover':hoverState}]" 
        v-bind:style="{width:width+'px',height:height+'px','clip-path':ClipPath}" @click="$emit('click')">
        <div class="extra-line left-top" v-if="!closeObliques[0]"></div>
        <div class="extra-line right-top" v-if="!closeObliques[1]"></div>
        <div class="extra-line right-bottom" v-if="!closeObliques[2]"></div>
        <div class="extra-line left-bottom" v-if="!closeObliques[3]"></div>
        <slot name="content"></slot>
    </div>
</template>
<script>
  export default {
    name: 'LzObliqueBox',
    componentName: 'LzObliqueBox',
    data() {
        return{
        };
    },
    props: {
        autoHover:{
            type:Boolean,
            default:false
        },
        hoverState:{
            type:Boolean,
            default:false
        },
        width:Number,
        height:Number,
        closeObliques:{
            type:Array,
            default:function(){return []}
        }
    },
    computed: {
        ClipPath:function(){
            var ob=this.closeObliques;
            var leftTop=ob[0]?'0 0':'0 13px, 13px 0, calc(100% - 13px) 0',
                rightTop=ob[1]?'100% 0':'calc(100% - 13px) 0, 100% 13px',
                rightBottom=ob[2]?'100% 100%':'100% calc(100% - 13px),calc(100% - 13px) 100%',
                leftBottom=ob[3]?'0 100%':'13px 100%,0 calc(100% - 13px)';
            return `polygon(${leftTop}, ${rightTop},${rightBottom},${leftBottom})`;
        }
    },
    methods: {
        // onBoxClick:function(){
        //     this.$emit('click');
        // }
    },
    mounted() {
    }
  };
</script>
<style type="text/css">
.lz-oblique-box{
    border:1px solid #1697A1;
    /* clip-path: polygon(0 13px, 13px 0, calc(100% - 13px) 0, 100% 13px,100% calc(100% - 13px),calc(100% - 13px) 100%,13px 100%,0 calc(100% - 13px)); */
    position: relative;
    transition-duration: .243s;
    cursor: pointer;
}
.lz-oblique-box.hover{
    box-shadow: 0px 0px 30px #1697A1 inset;
}
.lz-oblique-box.auto-hover:hover{
    box-shadow: 0px 0px 30px #1697A1 inset;
}

.extra-line{
    position: absolute;
    height: 0;
    width:18px;
    border-top: 1px solid #1697A1;
}

.extra-line.left-top{
    transform: rotate(-45deg);
    left: -3px;
    top: 5px;
}
.extra-line.right-top{
    transform: rotate(45deg);
    right: -3px;
    top: 5px;
}
.extra-line.right-bottom{
    transform: rotate(-45deg);
    right: -3px;
    bottom: 5px;
}
.extra-line.left-bottom{
    transform: rotate(45deg);
    left: -3px;
    bottom: 5px;
}
</style>