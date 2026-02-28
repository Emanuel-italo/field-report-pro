import jsPDF from "jspdf";

export interface FormData {
  nomeCliente: string;
  marca: string;
  modelo: string;
  numSerie: string;
  descricao: string; // <-- NOVO CAMPO
  pecaTrocada: string;
  pecaAtencao: string;
  valorPeca: string;
  valorPago: string;
  formaPagamento: string;
  fotos: string[];
  assinatura: string | null;
}

// === DEFINA SUAS CORES DO LOGO AQUI (RGB) ===
const HEADER_COLOR: [number, number, number] = [10, 75, 94]; 
const TEXT_COLOR: [number, number, number] = [26, 26, 26];
const LIGHT_BG: [number, number, number] = [240, 248, 250];

export async function generatePdf(data: FormData, logoBase64: string | null) {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  const contentWidth = pageWidth - margin * 2;
  let y = 10;

  const checkPageBreak = (needed: number) => {
    if (y + needed > 280) {
      doc.addPage();
      y = 10;
    }
  };

  // Helper functions
  const drawHeader = (text: string) => {
    checkPageBreak(10);
    doc.setFillColor(...HEADER_COLOR);
    doc.rect(margin, y, contentWidth, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(text, margin + 3, y + 5.5);
    doc.setTextColor(...TEXT_COLOR);
    y += 10;
  };

  const drawRow = (label: string, value: string, labelWidth = 40) => {
    checkPageBreak(8);
    doc.setFillColor(...LIGHT_BG);
    doc.rect(margin, y, labelWidth, 7, "F");
    doc.setDrawColor(200, 200, 200);
    doc.rect(margin, y, contentWidth, 7, "S");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(label, margin + 2, y + 4.5);
    doc.setFont("helvetica", "normal");
    doc.text(value || "-", margin + labelWidth + 2, y + 4.5);
    y += 7;
  };

  const drawTwoColumns = (label1: string, val1: string, label2: string, val2: string) => {
    checkPageBreak(8);
    const halfW = contentWidth / 2;
    const labelW = 35;
    doc.setFillColor(...LIGHT_BG);
    doc.rect(margin, y, labelW, 7, "F");
    doc.rect(margin + halfW, y, labelW, 7, "F");
    doc.setDrawColor(200, 200, 200);
    doc.rect(margin, y, halfW, 7, "S");
    doc.rect(margin + halfW, y, halfW, 7, "S");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(label1, margin + 2, y + 4.5);
    doc.setFont("helvetica", "normal");
    doc.text(val1 || "-", margin + labelW + 2, y + 4.5);
    doc.setFont("helvetica", "bold");
    doc.text(label2, margin + halfW + 2, y + 4.5);
    doc.setFont("helvetica", "normal");
    doc.text(val2 || "-", margin + halfW + labelW + 2, y + 4.5);
    y += 7;
  };

  // === TITLE & LOGO ===
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, "JPEG", margin, y, 30, 15);
    } catch {}
  }
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...HEADER_COLOR);
  doc.text("Relatório de Serviço", pageWidth / 2, y + 6, { align: "center" });
  
  // CNPJ Fixo da Empresa
  doc.setFontSize(10);
  doc.setTextColor(...TEXT_COLOR);
  doc.text("Cruztech Assistência", pageWidth / 2, y + 11, { align: "center" });
  doc.setFontSize(9);
  doc.text("CNPJ: 63.087.545/0001-05", pageWidth / 2, y + 15, { align: "center" });
  
  y += 20;

  // Date line
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const now = new Date();
  doc.text(
    `Gerado em ${now.toLocaleDateString("pt-BR")} às ${now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
    pageWidth - margin,
    y,
    { align: "right" }
  );
  y += 5;

  // === DADOS DO CLIENTE ===
  drawHeader("Dados do Cliente");
  drawRow("Nome do Cliente", data.nomeCliente, 40);

  // === EQUIPAMENTO ===
  drawHeader("Equipamento");
  drawTwoColumns("Marca", data.marca, "Modelo", data.modelo);
  drawRow("Nº de Série", data.numSerie, 40);

  // === SERVIÇO ===
  drawHeader("Detalhes do Serviço");
  
  // Bloco de Descrição (pode ter várias linhas)
  checkPageBreak(15);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Descrição do Serviço:", margin + 2, y + 4);
  y += 6;
  doc.setFont("helvetica", "normal");
  const descLines = doc.splitTextToSize(data.descricao || "-", contentWidth - 4);
  checkPageBreak(descLines.length * 4 + 2);
  doc.text(descLines, margin + 2, y + 3);
  y += descLines.length * 4 + 6;

  drawRow("Peça Trocada", data.pecaTrocada, 40);
  drawRow("Deixar c/ Atenção", data.pecaAtencao, 40);

  // === VALORES E PAGAMENTO ===
  drawHeader("Valores e Pagamento");
  drawTwoColumns("Valor da Peça", data.valorPeca, "Valor Pago", data.valorPago);
  drawRow("Forma de Pag.", data.formaPagamento, 40);

  // === FOTOS ===
  if (data.fotos.length > 0) {
    drawHeader("Fotos do Reparo");
    const photoSize = 55;
    const gap = 5;
    const cols2 = Math.floor(contentWidth / (photoSize + gap));
    
    for (let i = 0; i < data.fotos.length; i++) {
      const col = i % cols2;
      if (col === 0 && i > 0) y += photoSize + gap;
      checkPageBreak(photoSize + gap + 10);
      try {
        doc.addImage(
          data.fotos[i],
          "JPEG",
          margin + col * (photoSize + gap),
          y,
          photoSize,
          photoSize
        );
      } catch {}
    }
    y += photoSize + gap + 5;
  }

  // === ASSINATURA ===
  drawHeader("Aprovação do Cliente");
  checkPageBreak(40);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Assinatura:", margin + 2, y + 4);
  y += 5;
  if (data.assinatura) {
    try {
      doc.addImage(data.assinatura, "PNG", margin + 5, y, 60, 30);
    } catch {}
    y += 35;
  } else {
    y += 25;
  }

  // Footer
  doc.setFontSize(7);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(150, 150, 150);
  doc.text("Relatório gerado por Cruztech Assistência", pageWidth / 2, 290, { align: "center" });

  doc.save(`relatorio-${data.nomeCliente || "servico"}-${now.toISOString().slice(0, 10)}.pdf`);
}