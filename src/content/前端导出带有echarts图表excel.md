---
Excel 带有 echarts图表
---



# Excel导出

```js
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import * as echarts from 'echarts';

const downReport = async (row) => {
    if (!row.staus) return; // 确保状态正确

    loading.value = true;
    let tempDiv = null;

    try {
        // 1. 创建临时容器
        tempDiv = document.createElement('div');
        tempDiv.style.width = '800px';
        tempDiv.style.height = '500px';
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        document.body.appendChild(tempDiv);

        // 2. 初始化基础图表配置
        const myChart = echarts.init(tempDiv);
        const option = {
            backgroundColor: '#fff', // 改为白色背景更适合打印

            title: {
                text: '压力趋势分析',
                left: 'center',
                top: 20,
                textStyle: {
                    color: '#333',
                    fontSize: 18,
                    fontWeight: 'bold'
                }
            },

            xAxis: {
                data: [],
                boundaryGap: false,
                axisLine: {
                    lineStyle: {
                        color: '#999'
                    }
                },
                axisLabel: {
                    color: '#666'
                }
            },

            yAxis: {
                name: '压力值 (MPa)',
                nameTextStyle: {
                    color: '#666',
                    padding: [0, 0, 0, 40]
                },
                axisLine: {
                    lineStyle: {
                        color: '#999'
                    }
                },
                axisLabel: {
                    color: '#666',
                    formatter: '{value}'
                },
                splitLine: {
                    lineStyle: {
                        color: '#eee',
                        type: 'solid'
                    }
                }
            },

            grid: {
                left: '10%',
                right: '10%',
                bottom: '10%',
                top: '20%',
                containLabel: true
            },
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(50, 50, 50, 0.9)',
                borderWidth: 0,
                textStyle: {
                    color: '#fff'
                },
                axisPointer: {
                    type: 'line',
                    lineStyle: {
                        color: '#36a3f7',
                        width: 2
                    }
                }
            },
            visualMap: {
                show: false,
                dimension: 0,
                pieces: [
                    {
                        lte: 6,
                        color: '#00faff'
                    },
                    {
                        gt: 6,
                        lte: 9,
                        color: '#ffaa00'  // ffaa00 9b59b6 2ecc71 
                    },
                ]
            },
            series: [{
                name: '压力值',
                type: 'line',
                smooth: true,
                symbol: 'circle',
                symbolSize: 8,
                data: [],
                itemStyle: {
                    color: '#1890ff',
                    borderColor: '#fff',
                    borderWidth: 2
                },
                lineStyle: {
                    width: 3,
                    shadowColor: 'rgba(0, 0, 0, 0.1)',
                    shadowBlur: 10,
                    shadowOffsetY: 5
                },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(24, 144, 255, 0.4)' },
                        { offset: 1, color: 'rgba(24, 144, 255, 0.1)' }
                    ])
                },
            }]
        };
        myChart.setOption(option);

        // 3. 获取原始Excel数据
        const resPort = await downLoadReport(row.inspectionNewReportId);
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(resPort.data); // 加载之前的sheet表

        // 4. 获取设备数据并处理（改为 for...of 顺序处理）
        const resp = await getEquipNumApi();
        const respData = resp.data.data || [];

        for (const item of respData) {
            if (!item.equipmentPropertiesId) continue;

            const resProperties = await getTrendApi(item.equipmentPropertiesId);
            if (validatenull(resProperties.data.data)) continue;

            const newData = JSON.parse(resProperties.data.data);
            const xData = newData?.map(item => item.date) || [];
            const yData = newData?.map(item => item.data) || [];

            // 更新图表数据
            myChart.setOption({
                xAxis: { data: xData },
                series: [{ data: yData }]
            });

            // 等待图表渲染完成
            await new Promise(resolve => {
                myChart.on('finished', resolve);
                setTimeout(resolve, 1000); // 确保渲染完成
            });

            // 获取图表图片
            const chartCanvas = tempDiv.querySelector('canvas');
            if (!chartCanvas) throw new Error('图表渲染失败');
            const imageData = chartCanvas.toDataURL('image/png');

            // 添加新Sheet
            const chartSheet = workbook.addWorksheet(`${item.equipmentPropertiesName}(趋势图)`);
            const imageId = workbook.addImage({
                base64: imageData,
                extension: 'png',
            });
            chartSheet.addImage(imageId, {
                tl: { col: 1, row: 1 },
                ext: { width: 800, height: 500 }
            });
        }

        // 5. 最终导出
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `${row.inspectionNewReportName}报告_${new Date().toISOString().slice(0, 10)}.xlsx`);

    } catch (error) {
        console.error('导出失败:', error);
    } finally {
        if (tempDiv?.parentNode) {
            document.body.removeChild(tempDiv);
        }
        loading.value = false;
    }
};
```

