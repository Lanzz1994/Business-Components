<template>
    <div class="map-ctrl-box lz-oblique-btn-wraper" 
        v-bind:style="{width:BtnSize.width+'px',height:BtnSize.height+'px',left:left+'px',top:top+'px'}">
        <div class="lz-oblique-btn">
			<div class="oblique-border left"></div>
			<div class="oblique-center"></div>
			<div class="oblique-border right"></div>
            <div class="oblique-inner">
                <div class="btn-content"><slot name="content"></slot></div>
            </div>
		</div>
    </div>
</template>
<script>
  export default {
    name: 'LzObliqueButton',
    componentName: 'LzObliqueButton',
    data(props) {
        return{
            autoWidth:60,
            autoHeight:40
        };
    },
    props: {
        width:Number,
        height:Number,
        left:Number,
        top:Number,
        autoSize:{
            type:Boolean,
            default:true
        }
    },
    computed: {
        BtnSize:function(){
            return this.autoSize?
                {width:this.autoWidth,height:this.autoHeight}
                :{width:this.width,height:this.height};
        }
    },
    updated:function(){
        if(this.width===undefined){
            var size=this.getBtnContentSize();
            this.autoWidth=size.width;
            this.autoHeight=size.height;
        }
    },
    methods: {
        getBtnContentSize:function(){
            var btn= this.$el.querySelector('.btn-content');
            return {width:btn.clientWidth+8,height:btn.clientHeight+14};
        }
    },
    mounted() {
        if(this.autoSize){
            var size=this.getBtnContentSize();
            this.autoWidth=size.width;
            this.autoHeight=size.height;
        }
    }
  };
</script>
<style type="text/css">
    .lz-oblique-btn-wraper{
        width: 60px;
        height: 40px;
    }

    .lz-oblique-btn {
        width:100%;
        height:100%;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        border-color: #015A84;
        position: relative;
    }

        .lz-oblique-btn .oblique-border {
            border-color: inherit;
            border-style: solid;
            position: relative;
        }
            .lz-oblique-btn .oblique-border:after {
                content: "";
                width: 5px;
                background-color: #015A84;
                position: absolute;
            }

            .lz-oblique-btn .oblique-border.left:after {
                left:5px;
                top: -5px;
                bottom: -3px;
            }
            .lz-oblique-btn .oblique-border.right:after {
                left:-10px;
                top: -3px;
                bottom: -5px;
            }

            .lz-oblique-btn .oblique-border.left {
                border-left: none;
                border-right-width: 5px;
                border-top: 5px solid transparent;
                transform: translateX(-5px);
            }
            .lz-oblique-btn .oblique-border.right {
                border-right: none;
                border-left-width: 5px;
                border-bottom: 5px solid transparent;
                transform: translateX(5px);
            }

        .lz-oblique-btn .oblique-center {
            width: 100%;
            height: 87%;
            transform: translateY(7%);
            background-color: #015A84;
        }

        .oblique-inner{
            position: absolute;
            left:0;
            right:0;
            top:5px;
            bottom:5px;
            box-shadow: inset 0px 0px 16px 0px rgba(0, 228, 255, 0.8);
	        border: solid 1px #7ecef4;
        }

        .oblique-inner .btn-content{
            width:max-content;
            height:max-content;
            color:#fff;
            padding-left: 5px;
            display: flex;
            justify-content:center;
            align-content: center;
        }
</style>