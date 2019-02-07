import 'normalize.css'
import './table-editor.less'

//编辑表格的帮助类（“_”开头表示私有 变量 或 方法）
class LzzTable{
    constructor(props){
        props=props||{};
        this.tableKey=props.tableKey||null;
        this.Config.isEditColunm=props.isEditColunm||false;
        this._generateEditRowData(props.editColumns||[]);
        this.DataSource.set(props.dataSource||[]);
    }
    
    //表格的数据源
    _dataSource=[];
    _originalDataSource=[];
    DataSource={
        get:()=>{return this._dataSource},
        set:(v)=>{
            let data=[];
            //深层拷贝数组
            for(let i=0;i<v.length;i++){
                let obj=v[i];
                let re={};
                for(let key in obj){
                    let obj1=obj[key];
                    re[key]=obj1;
                }
                data.push(re);
            }

            this._dataSource=v;
            this._originalDataSource=data;
            this._editedIndexs=[];
            this._generateEditStates();
        }
    };

    //编辑数据源的方法集合
    DataSourceMethod={
        GetValue:(i,c)=>{
            let result=null;
            let row=this._dataSource[i];
            if(row!=undefined){
                result=(c==undefined?row:row[c])||null;
            }
            return result;
        }
    }

    //根据数据源构造的表格所有行的编辑状态
    editStates=[];
    EditStateMethod={
        //获取指定行的编辑状态
        Index:(i,column)=>{
            let state = this.editStates[i],editing=false;
            if(this.Config.isEditColunm){
                editing=state[column].editing;
            }else{
                editing=state.editing;
            }
            return editing;
        },
        //触发 或 去除 编辑状态
        Toggle:(props)=>{//关于 Toggle 的写法，只适合简单逻辑，有复杂业务逻辑的分开写
            let index=props.index,editing=props.editing,column=props.column||"";
            let state=null;
            if(this.Config.isEditColunm){
                state=this.editStates[index][column];
            }else{
                state= this.editStates[index];
            }
            if(state!=undefined){
                //重置上一次的编辑状态
                if(this.editIndex>-1){
                    if(this.Config.isEditColunm){
                        this.editStates[this.editIndex][this.editColumn].editing=false;
                    }else{
                        this.editStates[this.editIndex].editing=false;
                    }
                }
                //更新当前 行 或 列 的编辑状态
                if(this.Config.isEditColunm){
                    if(typeof editing=="undefined"){                    
                        this.editStates[index][column].editing=!state.editing;
                    }else{
                        this.editStates[index][column].editing=editing;
                    }
                }
                else{
                    if(typeof editing=="undefined"){                   
                        this.editStates[index].editing=!state.editing;
                    }else{
                        this.editStates[index].editing=editing;
                    }
                }
                //更新当前编辑行的索引、列名、行数据
                if(state.editing){
                    this.editIndex=index;
                    this.editColumn=column;
                }

                //操作数据
                switch(props.action){
                    case "editing":this.EditRowMethod.EditingRow(props.record);break;
                    case "save":this.EditRowMethod.SaveRowData();break;
                    case "cancel":this.EditRowMethod.CancelEdit();break;
                }

                //重置当前编辑行的索引、列名、行数据
                if(!state.editing){
                    this.editIndex=-1;
                    this.editColumn="";
                }

                //触发状态之后的回调
                if(typeof this.EditStateMethod._toggleAfter=="function"){
                    this.EditStateMethod._toggleAfter();
                }
            }
        },
        _toggleAfter:null,
        //_cancelEditingConfirm:null
    }

    //当前表格编辑的行数，-1表示未处于编辑状态
    editIndex=-1;

    //当前表格编辑的列的列明
    editColumn="";
    EditColumnMethod={
        //更新某一行列的值（未启用编辑功能时有效）
        SetColumnValue:(v,i,c)=>{
            this.editIndex=i;
            this.editColumn=c;
            this._dataSource[i][c]=v;
            this.EditedDataMethod._updateEditedIndex();
        }
    }

    //当前的操作状态 editing 编辑，save 保存，cancel 取消
    actionType="editing";

    //当前编辑的行数据
    editRowData=null;
    EditRowMethod={
        SaveRowData:()=>{
            for(let key of Object.keys(this.editRowData)){
                let value=this.editRowData[key];
                this._dataSource[this.editIndex][key]=value;
            }
            this.EditedDataMethod._updateEditedIndex();
        },
        _clear:()=>{
            for(let key of Object.keys(this.editRowData)){
                this.editRowData[key]=null;
            }
        },
        _eidtColumn:()=>{

        },
        EditingRow:(record)=>{
            if(this.Config.isEditColunm){
                this.editRowData[this.editColumn]=record[this.editColumn];
            }else{
                for(let key in this.editRowData){
                    this.editRowData[key]=record[key];
                }
            }
        },
        CancelEdit:()=>{
            let states=this.editStates[this.editIndex];
            if(this.Config.isEditColunm){
                this.editRowData[this.editColumn]=null;
            }else{
                for(let key in this.editRowData){
                    this.editRowData[key]=null;
                }
            }
        },
        DeleteRow:(i)=>{
            this._dataSource.splice(i,1);
            this._originalDataSource.splice(i,1);
            this._generateEditStates();
        },
        AddRow:(record)=>{
            this._dataSource.push(record);
            let ori={};
            for(let key in record){
                ori[key]=record[key];
            }
            this._originalDataSource.push(ori);
            this._generateEditStates();
        }
    }

    //编辑过的数据索引
    _editedIndexs=[]
    EditedDataMethod={
        GetEditedData:()=>{
            let editedData=[];
            this._editedIndexs.map((v)=>{
                editedData.push(this._dataSource[v]);
            });
            return editedData;
        },
        //记录编辑过的数据的索引
        _updateEditedIndex:()=>{
            let edited=false;
            let originalRow=this._originalDataSource[this.editIndex],
                editedRow=this._dataSource[this.editIndex];
            for(let key in editedRow){
                if(editedRow[key]!==originalRow[key]){
                    edited=true;
                }
            }
            let index=this._editedIndexs.indexOf(this.editIndex);
            if(edited&&index===-1){
                this._editedIndexs.push(this.editIndex);
            }else{
                if(!edited&&index>-1){
                    this._editedIndexs=this._editedIndexs.filter(i=>i!=this.editIndex);//js 原本的引用会被释放掉？
                }
            }
        }
    }

    Config={
        //是否启用列编辑，默认行
        isEditColunm:false,
        //是否开启提醒
        cancelEditingConfirm:false
    }

    tableKey=null

    //根据数据源生成编辑状态
    _generateEditStates=()=>{
        let states=[],data=this._dataSource||[];
        if(this.Config.isEditColunm){
            data.map((v,i)=>{
                let state={};
                for(let key of Object.keys(v)){
                    state[key]={editing:false};
                }
                states.push(state);
            });
        }else{
            data.map(v=>states.push({editing:false}));
        }
        this.editStates=states;
    }
    
    //生成行编辑数据模板
    _generateEditRowData=(columns)=>{
        let obj={};
        columns.map((v)=>{obj[v]=null;});
        this.editRowData=obj;
    }
}


export default LzzTable;