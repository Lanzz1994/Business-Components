!(function (window) {
    //构造函数
    var AnalysisArea = function (options) {
        var _this = this;

        if (options.map) {
            this.options = options;
            this.map = options.map;
            this.analysisLayer = options.analysisLayer || null;
            this.addPolyanalysis = options.addPolyanalysis;
            this.drawLayerName = 'AnalysisArea_' + getRandomName();
            this.drawLayer = LayerMethod.addLayer(this.drawLayerName, true);
            if (options.click) { this.drawLayer.on('click', options.click); }

            //绑定画图结束
            this.map.on('pm:drawend', function (e) {
                var asisResult = _this._endDrawPoly();
                _this.map._layers[_this.map.pm.Draw.Poly._layer._renderer._drawLast.layer._leaflet_id].remove();
                if (options.analysisPoly) { options.analysisPoly(asisResult); }
            });

            //绑定缩放
            this.map.on('zoom', function (e) {
                var zoom = e.target.getZoom();
                var els = document.querySelectorAll('.leaflet-marker-pane .' + _this.drawLayerName);
                if (e.target.getZoom() < 8) {
                    for (var i = 0; i < els.length; i++) {
                        els[i].style['display'] = 'none';
                    }
                } else {
                    for (var i = 0; i < els.length; i++) {
                        els[i].style['display'] = 'block';
                    }
                }
            });
        } else {
            throw new Error("map 不能为空");
        }
    }

    //map,analysisLayer,serialFormat
    AnalysisArea.prototype.options = {};
    AnalysisArea.prototype.map = null;
    AnalysisArea.prototype.analysisLayer = null;
    AnalysisArea.prototype.analysisPolyFilter = null;
    AnalysisArea.prototype.drawLayerName = null;
    AnalysisArea.prototype.drawLayer = null;
    AnalysisArea.prototype.Polys = {};

    AnalysisArea.prototype.drawPolyStore = null;
    //开启画面
    AnalysisArea.prototype.startDrawPoly = function (options) {
        var drawOpts = Object.assign({
            key: getRandomName(),
            pathOptions: {
                color: '#808080',
                fillColor: '#808080',
            },
            finishOn: 'dblclick',
            analysisData: null
        }, options);
        this.drawPolyStore = drawOpts;
        this.map.pm.enableDraw('Poly', drawOpts);
    };
    AnalysisArea.prototype._endDrawPoly = function () {
        var polyCollection = [], coord = pointsToPolygon(this.map.pm.Draw.Poly._layer.toGeoJSON().geometry.coordinates);
        return this._drawAndAnalysisPoly(coord, this.analysisLayer);
    }
    //计算面的面积
    AnalysisArea.prototype.computeInfoBetweenPolys = computeInfoBetweenPolys;
    //异常指定面集合
    AnalysisArea.prototype.removeDrawPolys = function (keys) {
        var _this = this;
        keys.map(function (key) {
            removeDrawPoly(_this.Polys[key] || {});
            _this.Polys[key] = null;
            delete _this.Polys[key];
        });
    }

    //添加面，返回计算信息
    AnalysisArea.prototype.addPolys = function (key, coord, options, layer) {
        pointsToPolygon(coord);
        if (this.Polys[key]) { this.removeDrawPolys([key]) }
        var drawOpts = Object.assign({
            key: key,
            pathOptions: {
                color: '#808080',
                fillColor: '#808080'
            },
            finishOn: 'dblclick',
            analysisData: null,
            isFly: false,
        }, options);
        this.drawPolyStore = drawOpts;
        var asisResult = this._drawAndAnalysisPoly(coord, layer);
        if (this.options.addPolyanalysis) { this.options.addPolyanalysis(asisResult); }
    }
    
    AnalysisArea.prototype._drawAndAnalysisPoly = function (coord, layer) {
        var key = (this.drawPolyStore || { key: getRandomName() }).key;
        var analysis = { key: key, asisResult: null };
        if (coord.length > 3) {            
            //画面
            var poly = addDrawPoly(this.map, this.drawLayer, coord, (this.drawPolyStore || {}).pathOptions);
            var points = addSerialNum(this.drawLayer, coord, this.options.serialFormat, this.drawLayerName);
            this.Polys[key] = { poly: poly, points: points };

            //分析面
            var polyCollection = this.drawPolyStore.analysisData || [];
            if (polyCollection.length === 0 && layer) {
                layer.layer.eachLayer(function (l) {
                    if (this.analysisPolyFilter) {
                        var fi = analysisPolyFilter(l);
                        if (fi.add) {
                            polyCollection.push({ attrs: fi.attrs, coordinates: l.toGeoJSON().geometry.coordinates });
                        }
                    } else {
                        polyCollection.push({ coordinates: l.toGeoJSON().geometry.coordinates });
                    }
                });
            }
            if (polyCollection.length > 0) {
                analysis = { key: key, analysis: computeInfoBetweenPolys(coord, polyCollection) };
            }
        }
        if ((this.drawPolyStore || { isFly: false }).isFly && poly) {
            this.map.fitBounds(poly.getBounds());
        }
        this.drawPolyStore = null;
        return analysis;
    }

    //添加点击顺序
    function addSerialNum(layer, points, format, drawName) {
        var ps = [].concat(points);
        if (ps[0][0] === ps[ps.length - 1][0] && ps[0][1] === ps[ps.length - 1][1]) { ps.splice(ps.length - 1, 1); }
        return ps.map(function (point, i) {
            var content = '<div class="analysis-serial ' + drawName + '">' + (format ? format(i) : '<div class="analysis-serial-block"></div><div class="analysis-serial-text">' + (i + 1) + '</div>') + '</div>';
            return layer.addPoints([point], {
                feature: { icon: 'div', src: { html: content } },
            })[0];
        }).filter(function (v) { return v !== undefined });
    }

    //添加画完的面
    function addDrawPoly(map, layer, lonlats, options) {
        var opts = Object.assign({ color: '#808080', fillOpacity: 0.5, weight: 1 }, options);
        return layer.addPolygons([{ coordinates: lonlats }], { feature: opts })[0];
    }

    //获取两个重叠的面的信息（面积、相交经纬度范围、面）
    function computeInfoBetweenPolys(refer_poly_coord, polys_coords) {

        var duplicates = getPolysDuplicate(splitSelfIntersection(refer_poly_coord)), infos = [];

        polys_coords.map(function (v, i) {
            var hasInterest = false, area = 0, intersect = [], errs = [];
            duplicates.map(function (t_draw_poly) {
                try {
                    var t_poly = turf.polygon(v.coordinates);
                    var poly_intersect = turf.intersect(t_draw_poly.poly, t_poly);
                    if (poly_intersect) {
                        area += turf.area(poly_intersect);
                        intersect.push(poly_intersect.geometry.coordinates);
                    }
                } catch (e) {
                    errs.push(e.message);
                }
            });

            infos.push({
                area: area,
                intersect: intersect,
                poly: v.coordinates,
                refer_poly: refer_poly_coord,
                attrs: v.attrs || null,
                errs: errs
            });
        });
        return infos;
    }

    //自交面分割成多个面
    function splitSelfIntersection(lonlats) {
        var polys = [];
        for (var i = 2; i < lonlats.length - 1; i++) {
            var currentLine = [lonlats[i], lonlats[i + 1]];
            //当前线段的前一条线不会产生交叉的情况（排除线段首尾点重合的情况）
            //遍历时一次取两个点，j 在 1 时，点就取完了，不为 0
            for (var j = i - 1; j > 0; j--) {
                var line = [lonlats[j - 1], lonlats[j]];
                //获取两条线段的交叉点
                var intersect = turf.lineIntersect(turf.lineString(line), turf.lineString(currentLine));
                //判断是否有交叉点（分解到最后一个多边形时，最后一条的尾点和第一条线段首点交叉，这种情况要排除）
                if (intersect.features.length > 0 && currentLine[1][0] !== line[0][0] && currentLine[1][1] !== line[0][1]) {
                    //交叉点保留6位
                    var intersectPoint = intersect.features[0].geometry.coordinates;
                    intersectPoint = [parseFloat(intersectPoint[0].toFixed(6)), parseFloat(intersectPoint[1].toFixed(6))];

                    //构造新的的经纬度集合
                    var nextLonlats = [].concat(lonlats);
                    //删除过滤的经纬度并加入交叉点
                    var targetLonlats = nextLonlats.splice(j, i - j + 1, intersectPoint);
                    //筛选两条交叉线范围内的经纬度，交叉点设为首尾点
                    targetLonlats.push(intersectPoint);
                    targetLonlats.unshift(intersectPoint);
                    //添加到分解的面集合里
                    polys.push(targetLonlats);

                    //传入新的经纬度继续分解
                    return polys.concat(splitSelfIntersection(nextLonlats));
                }
            }
        }
        //分解到最后一个多边形没有交叉点，直接返回全部的经纬度
        polys.push(lonlats);
        return polys;
    }

    //获取各个面重叠的经纬度
    function getPolysDuplicate(coords) {
        var duplicates = coords.map(function (v) { return { poly: turf.polygon([v]), duplicates: [] } });
        for (var i = 0; i < duplicates.length - 1; i++) {
            var currentDup = duplicates[i];
            for (var j = i + 1; j < duplicates.length; j++) {
                var intersection = turf.intersect(currentDup.poly, duplicates[j].poly);
                if (intersection && intersection.geometry.type === 'Polygon') {
                    duplicates[i].duplicates.push(intersection);
                    duplicates[j].duplicates.push(intersection);
                }
            }
        }
        duplicates.map(function (v) {
            if (v.duplicates.length > 1) {
                var union = v.duplicates[0];
                for (var i = 1; i < v.duplicates.length; i++) {
                    union = turf.union(union, v.duplicates[i]);
                }
                v.duplicates = [union];
            }
            v.duplicates = v.duplicates[0];
        });
        return duplicates;
    }

    function removeDrawPoly(drawPoly) {
        if (drawPoly.poly) {
            drawPoly.poly.remove();
        }
        if (drawPoly.points) { drawPoly.points.map(function (v) { v.remove(); }) }
    }

    function getRandomName(num) {
        return Math.random().toFixed(num || 6).replace('0.', '');
    }

    function pointsToPolygon(points) {
        if (points[0][0] !== points[points.length - 1][0] || points[0][1] !== points[points.length - 1][1]) {
            points.push(points[0]);
        }
        return points;
    }

    window.AnalysisArea = AnalysisArea;
    document.getElementsByTagName("head")[0].innerHTML += '<style>.leaflet-div-icon{background-color:transparent!important;border:none!important}.analysis-serial-block{width:5px;height:5px;border:1px solid #909090;border-radius:50%;background-color:#fff;position:relative;left:3px;top:3px;}.analysis-serial-text{position:relative;left:3px;font-size:13px;}</style>';
})(window);