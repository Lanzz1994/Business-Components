<template>
    <div class="lz-platform-media-wraper map-ctrl-box">
        <div class="platform-media map-ctrl-box" v-for="item in platforms" :key="item.id" :id="item.id">
            <div class="media-image">
                <img v-if="item.image" :src="item.image"/>
            </div>
            <div class="media-buttons">
                <div class="media-button-wraper" v-for="(btn,bindex) in item.buttons" v-bind:key="bindex" :id="'media-btn-'+btn.type" v-bind:style="{left:btn.left+'px',top:btn.top+'px'}">
                    <div class="media-button" @click="onMediaClick">
                        <div class="media-button-inner" v-html="btn.name"></div>
                    </div>
                    <transition name="location">
                        <div class="platform-media-location" v-if="platformActive===btn.type" :style="getLocationStyle(btn)">
                            <div class="location-sign top left"></div>
                            <div class="location-sign top right"></div>
                            <div class="location-sign bottom right"></div>
                            <div class="location-sign bottom left"></div>
                        </div>
                    </transition>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
  export default {
    name: 'LzPlatformMedia',
    componentName: 'LzPlatformMedia',
    data() {
        return{};
    },
    props: {
        platforms:{
            type:Array,
            default:function(){return []}
        },
        platformActive:{
            type:String,
            default:''
        },
        platformInfo:{
            type:Object,
            default:{}
        }
    },
    computed: {
    },
    methods: {
        onMediaClick:function(e){
            this.$emit('media-btn-click',e);
        },
        getLocationStyle:function(item){
            var info=this.platformInfo[item.type];
            return {
                width:info.size.width+'px',
                height:info.size.height+'px',
                left:info.offset.x+'px',
                top:info.offset.y+'px',
            };
        }
    }
  };
</script>
<style type="text/css">
    .lz-platform-media-wraper{
        position: absolute;
        left:0;
        top:0;
    }

    .lz-platform-media-wraper .map-ctrl-box{
        position: absolute;
    }

    .media-button{
        position: absolute;
        width:max-content;
        padding:6px;
        background-color: #015A84;
        cursor: pointer;
        clip-path: polygon(0 7px,7px 0,14px 0,14px 2px,calc(100% - 14px) 2px,calc(100% - 14px) 0,100% 0,100% calc(100% - 7px),calc(100% - 7px) 100%,calc(100% - 14px) 100%,calc(100% - 14px) calc(100% - 2px),14px calc(100% - 2px),14px 100%,0 100%);
    }

    .media-button-wraper{
        position: absolute;
    }

    .media-button-inner{
        padding:6px 10px;
        border: solid 1px #7ecef4;
        box-shadow: inset 0px 0px 16px 0px rgba(0, 228, 255, 0.8);
        color:#fff;
        font-size: 15px;
    }

    .platform-media-location{
        position: absolute;
        min-width: 30px;
        min-height: 30px;
    }

    .location-sign{
        position: absolute;
        border-left: 3px solid #F15D38;
        border-top: 3px solid #F15D38;
        width:10px;
        height:10px;
        border-top-left-radius: 5px;
    }

    .location-sign.bottom{
        bottom:0;
    }
    .location-sign.right{
        right:0;
    }
    .location-sign.top.right{
        transform: rotate(90deg);
    }
    .location-sign.bottom.right{
        transform: rotate(180deg);
    }
    .location-sign.bottom.left{
        transform: rotate(270deg);
    }

    
    .location-enter-active {
        animation: location-flicker .493s;
    }

    @keyframes location-flicker {
        from {
          transform: scale(4.5);
        }

        to {
          transform: scale(1);
        }
    }
</style>