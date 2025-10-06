import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { TransactionData } from '@/types/financial';
import { generateCategoryStats } from './dataProcessor';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

// 声明jsPDF的autoTable方法
// 移除对 pdf.autoTable 的类型扩展，改为使用函数形式 autoTable(doc, options)

export interface ExportData {
  totalIncome: number;
  totalExpense: number;
  transactionCount: number;
  dateRange: string;
  transactions: TransactionData[];
}

export const exportToPDF = async (chartsElementId: string, tablesElementId: string, data: ExportData) => {
  try {
    console.log('开始PDF导出，参数:', { chartsElementId, tablesElementId, dataLength: data.transactions.length });
    
    const chartsElement = document.getElementById(chartsElementId);
    const tablesElement = document.getElementById(tablesElementId);
    
    console.log('DOM元素检查:', { 
      chartsElement: !!chartsElement, 
      tablesElement: !!tablesElement,
      chartsElementSize: chartsElement ? { width: chartsElement.offsetWidth, height: chartsElement.offsetHeight } : null
    });
    
    if (!chartsElement || !tablesElement) {
      const error = `找不到要导出的元素: charts=${!!chartsElement}, tables=${!!tablesElement}`;
      console.error(error);
      throw new Error(error);
    }
    
    if (chartsElement.offsetWidth === 0 || chartsElement.offsetHeight === 0) {
      const error = '图表元素尺寸为0，可能未正确渲染';
      console.error(error);
      throw new Error(error);
    }

    console.log('图表元素尺寸:', {
      width: chartsElement.scrollWidth,
      height: chartsElement.scrollHeight,
      offsetWidth: chartsElement.offsetWidth,
      offsetHeight: chartsElement.offsetHeight
    });

    // 等待图表完全渲染
    await new Promise(resolve => {
      const checkCharts = () => {
        const svgs = chartsElement.querySelectorAll('svg');
        const canvases = chartsElement.querySelectorAll('canvas');
        const rechartContainers = chartsElement.querySelectorAll('.recharts-wrapper');
        
        console.log('图表渲染检查:', {
          svgCount: svgs.length,
          canvasCount: canvases.length,
          rechartContainers: rechartContainers.length
        });
        
        // 检查是否有足够的图表元素
        if (svgs.length > 0 || canvases.length > 0 || rechartContainers.length > 0) {
          resolve(true);
        } else {
          setTimeout(checkCharts, 100);
        }
      };
      
      setTimeout(checkCharts, 500); // 初始延迟
    });

    // 创建PDF文档
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
      compress: true
    });
    
    // 标题与时间使用英文，避免中文字体依赖
    pdf.setFont('helvetica');
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    
    // 添加英文标题与生成时间（避免中文乱码）
    pdf.setFontSize(20);
    pdf.text('Financial Analysis Report', pageWidth / 2, 20, { align: 'center' });
    pdf.setFontSize(11);
    const currentDate = new Date().toLocaleString();
    pdf.text(`Generated: ${currentDate}`, margin, 30);
    
    let currentY = 40;
    
    // 捕获图表区域
    console.log('开始捕获图表，html2canvas配置:', {
      scale: 1.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: chartsElement.scrollWidth,
      height: chartsElement.scrollHeight
    });
    
    const chartsCanvas = await html2canvas(chartsElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: chartsElement.scrollWidth,
      height: chartsElement.scrollHeight,
      logging: false,
      foreignObjectRendering: false,
      removeContainer: false,
      imageTimeout: 15000,
    });
    
    console.log('图表捕获完成，canvas尺寸:', { width: chartsCanvas.width, height: chartsCanvas.height });
    
    const chartsImgData = chartsCanvas.toDataURL('image/png');
    const chartsImgWidth = contentWidth;
    let chartsImgHeight = (chartsCanvas.height * chartsImgWidth) / chartsCanvas.width;
    // 若图片高度超过页面可用高度，缩放以适配
    const maxImgHeight = pageHeight - 2 * margin;
    if (chartsImgHeight > maxImgHeight) {
      const scaleFactor = maxImgHeight / chartsImgHeight;
      chartsImgHeight = chartsImgHeight * scaleFactor;
    }
    
    // 检查是否需要新页面放置图表
    if (currentY + chartsImgHeight > pageHeight - margin) {
      pdf.addPage();
      currentY = margin;
    }
    
    pdf.addImage(chartsImgData, 'PNG', margin, currentY, chartsImgWidth, chartsImgHeight);
    currentY += chartsImgHeight + 20;
    
    // 捕获数据详情区域（包含中文表格与布局），避免中文乱码
    const tablesCanvas = await html2canvas(tablesElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: tablesElement.scrollWidth,
      height: tablesElement.scrollHeight,
      logging: false,
      foreignObjectRendering: false,
      removeContainer: false,
      imageTimeout: 15000,
    });

    const tablesImgData = tablesCanvas.toDataURL('image/png');
    const tablesImgWidth = contentWidth;
    let tablesImgHeight = (tablesCanvas.height * tablesImgWidth) / tablesCanvas.width;
    if (tablesImgHeight > maxImgHeight) {
      const scaleFactor = maxImgHeight / tablesImgHeight;
      tablesImgHeight = tablesImgHeight * scaleFactor;
    }

    // 页面剩余空间不足时换页
    if (currentY + tablesImgHeight > pageHeight - margin) {
      pdf.addPage();
      currentY = margin;
    }
    pdf.addImage(tablesImgData, 'PNG', margin, currentY, tablesImgWidth, tablesImgHeight);
    
    // 保存PDF
    const fileName = `财务分析报告_${new Date().toISOString().split('T')[0].replace(/-/g, '')}_${new Date().toTimeString().split(' ')[0].replace(/:/g, '')}.pdf`;
    console.log('准备保存PDF文件:', fileName);
    
    pdf.save(fileName);
    console.log('PDF导出成功完成');
    
    return true;
  } catch (error) {
    console.error('PDF导出失败，详细错误信息:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // 提供更友好的错误信息
    let friendlyMessage = 'PDF导出失败，请重试';
    if (error instanceof Error) {
      if (error.message.includes('找不到要导出的元素') || error.message.includes('not found')) {
        friendlyMessage = '页面元素未找到，请确保数据已加载完成后再试';
      } else if (error.message.includes('尺寸为0') || error.message.includes('chart')) {
        friendlyMessage = '图表未完全加载，请等待图表渲染完成后重试';
      } else if (error.message.includes('html2canvas') || error.message.includes('canvas')) {
        friendlyMessage = '图表捕获失败，请尝试刷新页面后重新导出';
      } else if (error.message.includes('jsPDF') || error.message.includes('PDF')) {
        friendlyMessage = 'PDF生成失败，请检查数据完整性';
      } else if (error.message.includes('网络') || error.message.includes('network')) {
        friendlyMessage = '网络连接问题，请检查网络后重试';
      }
    }
    
    throw new Error(friendlyMessage);
  }
};

// 导出单个图表
export const exportChartToPDF = async (chartElementId: string, title: string) => {
  try {
    const element = document.getElementById(chartElementId);
    if (!element) {
      throw new Error('找不到要导出的图表元素');
    }

    // 创建PDF文档，设置UTF-8编码支持
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
      compress: true
    });
    
    // 设置字体以支持中文
    pdf.setFont('helvetica');
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    // 添加标题
    pdf.setFontSize(18);
    pdf.text(title, pageWidth / 2, 20, { align: 'center' });
    
    // 添加生成时间
    pdf.setFontSize(10);
    const currentDate = new Date().toLocaleString('zh-CN');
    pdf.text(`生成时间: ${currentDate}`, pageWidth / 2, 30, { align: 'center' });
    
    // 捕获图表
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = pageWidth - 40;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 20, 40, imgWidth, imgHeight);
    
    const fileName = `${title}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
    
    return true;
  } catch (error) {
    console.error('图表PDF导出失败:', error);
    throw error;
  }
};