// 使用立即执行函数表达式(IIFE)创建模块
const MapModule = (function() {
    // 私有变量
    let map = null;
    let currentDestination = null;
    let currentDestinationName = '';
    let currentMode = 'driving';
    let routeSearch = null;
    let ac = null;

    // 私有方法
    function initMap(container, destination, destinationName) {
        // 创建地图实例
        const mapInstance = new BMap.Map(container);
        
        // 创建目的地点
        const destinationPoint = new BMap.Point(destination.lng, destination.lat);
        mapInstance.centerAndZoom(destinationPoint, 15);
        
        // 添加地图控件
        mapInstance.addControl(new BMap.NavigationControl());
        mapInstance.addControl(new BMap.ScaleControl());
        mapInstance.enableScrollWheelZoom();

        // 添加目的地标记
        const marker = new BMap.Marker(destinationPoint);
        mapInstance.addOverlay(marker);
        
        // 添加信息窗口
        const infoWindow = new BMap.InfoWindow(destinationName);
        marker.addEventListener("click", function() {
            mapInstance.openInfoWindow(infoWindow, destinationPoint);
        });

        return mapInstance;
    }

    // 规划路线
    function planRoute() {
        const startLocation = document.getElementById('start-location');
        const startValue = startLocation.value;
        
        if (!startValue) {
            alert('请输入起点位置');
            return;
        }

        // 清除之前的路线
        map.clearOverlays();

        // 创建地址解析器实例
        const myGeo = new BMap.Geocoder();
        
        // 将起点地址解析结果显示在地图上，并规划路线
        myGeo.getPoint(startValue, function(startPoint) {
            if (startPoint) {
                // 添加起点标记
                const startMarker = new BMap.Marker(startPoint);
                map.addOverlay(startMarker);

                // 添加终点标记
                const endPoint = new BMap.Point(currentDestination.lng, currentDestination.lat);
                const endMarker = new BMap.Marker(endPoint);
                map.addOverlay(endMarker);

                // 创建路线规划实例
                let routeOptions = {
                    renderOptions: {
                        map: map,
                        autoViewport: true,
                        enableDragging: true
                    },
                    onSearchComplete: function(results) {
                        if (routeSearch.getStatus() == BMAP_STATUS_SUCCESS) {
                            // 获取第一条方案
                            let plan = results.getPlan(0);
                            
                            // 创建路程信息窗口内容
                            let content = '';
                            switch (currentMode) {
                                case 'driving':
                                    content = `<div style="padding:8px;">
                                        <p>驾车路线</p>
                                        <p>距离：${plan.getDistance(true)}</p>
                                        <p>预计用时：${plan.getDuration(true)}</p>
                                    </div>`;
                                    break;
                                case 'transit':
                                    content = `<div style="padding:8px;">
                                        <p>公交路线</p>
                                        <p>距离：${plan.getDistance(true)}</p>
                                        <p>预计用时：${plan.getDuration(true)}</p>
                                        <p>花费：${plan.getPrice()}元</p>
                                    </div>`;
                                    break;
                                case 'walking':
                                    content = `<div style="padding:8px;">
                                        <p>步行路线</p>
                                        <p>距离：${plan.getDistance(true)}</p>
                                        <p>预计用时：${plan.getDuration(true)}</p>
                                    </div>`;
                                    break;
                                case 'riding':
                                    content = `<div style="padding:8px;">
                                        <p>骑行路线</p>
                                        <p>距离：${plan.getDistance(true)}</p>
                                        <p>预计用时：${plan.getDuration(true)}</p>
                                    </div>`;
                                    break;
                            }

                            // 创建信息窗口
                            let infoWindow = new BMap.InfoWindow(content);
                            
                            // 在起点和终点的中间位置显示信息窗口
                            let centerPoint = new BMap.Point(
                                (startPoint.lng + endPoint.lng) / 2,
                                (startPoint.lat + endPoint.lat) / 2
                            );
                            map.openInfoWindow(infoWindow, centerPoint);
                        } else {
                            alert('抱歉，未找到合适的路线。');
                        }
                    }
                };

                // 根据交通方式选择不同的路线规划方法
                switch (currentMode) {
                    case 'driving':
                        routeSearch = new BMap.DrivingRoute(map, routeOptions);
                        break;
                    case 'transit':
                        routeSearch = new BMap.TransitRoute(map, routeOptions);
                        break;
                    case 'walking':
                        routeSearch = new BMap.WalkingRoute(map, routeOptions);
                        break;
                    case 'riding':
                        routeSearch = new BMap.RidingRoute(map, routeOptions);
                        break;
                }

                // 执行路线搜索
                if (routeSearch) {
                    routeSearch.search(startPoint, endPoint);
                    // 保存起点坐标
                    startLocation.dataset.lng = startPoint.lng;
                    startLocation.dataset.lat = startPoint.lat;
                }
            } else {
                alert('无法解析起点地址，请重新输入');
            }
        }, '泉州市');
    }

    // 使用当前位置
    function useCurrentLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    // 将WGS84坐标转换为百度坐标
                    const wgsLng = position.coords.longitude;
                    const wgsLat = position.coords.latitude;
                    
                    // 创建坐标转换函数
                    const convertCoord = function(lng, lat, callback) {
                        const point = new BMap.Point(lng, lat);
                        const convertor = new BMap.Convertor();
                        const pointArr = [point];
                        
                        convertor.translate(pointArr, 1, 5, function(data) {
                            if (data.status === 0) {
                                callback(data.points[0]);
                            } else {
                                alert('坐标转换失败，请手动输入位置');
                            }
                        });
                    };

                    // 执行坐标转换
                    convertCoord(wgsLng, wgsLat, function(baiduPoint) {
                        // 使用逆地址解析获取位置描述
                        const geoc = new BMap.Geocoder();
                        geoc.getLocation(baiduPoint, function(rs) {
                            const address = rs.address;
                            document.getElementById('start-location').value = address;
                            // 保存转换后的坐标点
                            document.getElementById('start-location').dataset.lng = baiduPoint.lng;
                            document.getElementById('start-location').dataset.lat = baiduPoint.lat;
                            planRoute();
                        });
                    });
                },
                function(error) {
                    let errorMsg = '获取位置失败: ';
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMsg += '请允许浏览器获取位置权限';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMsg += '位置信息不可用';
                            break;
                        case error.TIMEOUT:
                            errorMsg += '获取位置超时';
                            break;
                        default:
                            errorMsg += '未知错误';
                    }
                    alert(errorMsg);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        } else {
            alert('您的浏览器不支持地理定位');
        }
    }

    // 公开的API
    return {
        // 初始化地图和路线规划功能
        init: function(containerId, destination, destinationName) {
            try {
                // 保存目的地信息
                currentDestination = destination;
                currentDestinationName = destinationName;

                // 初始化地图
                map = initMap(containerId, destination, destinationName);

                // 初始化地址联想控件
                ac = new BMap.Autocomplete({
                    "input": "start-location",
                    "location": "泉州市"
                });

                // 地址联想选中事件
                ac.addEventListener('onconfirm', function(e) {
                    const _value = e.item.value;
                    const myValue = _value.province + _value.city + _value.district + _value.street + _value.business;
                    document.getElementById('start-location').value = myValue;
                });

                // 绑定事件监听器
                this.bindEvents();

                // 返回初始化状态
                return true;
            } catch (error) {
                console.error('地图初始化失败:', error);
                return false;
            }
        },

        // 更新目的地
        updateDestination: function(destination, destinationName) {
            try {
                if (!map) {
                    console.error('地图未初始化');
                    return false;
                }

                currentDestination = destination;
                currentDestinationName = destinationName;

                // 清除所有覆盖物
                map.clearOverlays();

                // 创建目的地坐标点
                const point = new BMap.Point(destination.lng, destination.lat);
                
                // 添加目的地标记
                const marker = new BMap.Marker(point);
                map.addOverlay(marker);
                
                // 设置地图中心和缩放级别
                map.centerAndZoom(point, 15);

                // 添加信息窗口
                const infoWindow = new BMap.InfoWindow(destinationName);
                marker.addEventListener('click', function() {
                    map.openInfoWindow(infoWindow, point);
                });

                // 如果已有起点，重新规划路线
                const startLocation = document.getElementById('start-location');
                if (startLocation && startLocation.value) {
                    planRoute();
                }

                return true;
            } catch (error) {
                console.error('更新目的地失败:', error);
                return false;
            }
        },

        // 绑定事件监听器
        bindEvents: function() {
            // 绑定交通方式切换事件
            document.querySelectorAll('.transport-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    document.querySelectorAll('.transport-btn').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    currentMode = this.dataset.mode;
                    if (document.getElementById('start-location').value) {
                        planRoute();
                    }
                });
            });

            // 绑定规划路线按钮事件
            document.getElementById('plan-route').addEventListener('click', planRoute);

            // 绑定使用当前位置按钮事件
            document.getElementById('use-current-location').addEventListener('click', useCurrentLocation);
        }
    };
})(); 