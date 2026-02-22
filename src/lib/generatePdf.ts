import jsPDF from "jspdf";

export interface FormData {
  // Cliente
  clienteNome: string;
  clienteEmail: string;
  razaoSocial: string;
  cnpj: string;
  endereco: string;
  infoAdicionais: string;
  // Info gerais
  tipoServico: string;
  kmVeiculo: string;
  localizacaoGps: string;
  // Ativos
  equipamentos: {
    nome: string;
    marca: string;
    modelo: string;
    numSerie: string;
    informacoes: string;
  }[];
  // PMOC
  mesReferencia: string;
  periodo: string;
  checklist: {
    filtrosAr: {
      limparElementos: "conforme" | "nao_conforme" | null;
      verificarFixacao: "conforme" | "nao_conforme" | null;
    };
    gabinetes: {
      verificarRenovacao: "conforme" | "nao_conforme" | null;
      verificarBotoeiras: "conforme" | "nao_conforme" | null;
    };
  };
  // Ocorrência
  problemaIdentificado: string;
  servicoRealizado: string;
  // Fotos & assinatura
  fotos: string[];
  assinatura: string | null;
}

const HEADER_COLOR: [number, number, number] = [90, 80, 140]; // Purple/blue header
const TEXT_COLOR: [number, number, number] = [30, 30, 30];
const LIGHT_BG: [number, number, number] = [245, 245, 250];

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

  // === TITLE ===
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, "JPEG", margin, y, 30, 15);
    } catch {}
  }
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...HEADER_COLOR);
  const title = data.tipoServico === "Manutenção Preventiva"
    ? "Preventiva Mensal PMOC"
    : "Relatório de Visita Técnica";
  doc.text(title, pageWidth / 2, y + 6, { align: "center" });
  doc.setFontSize(11);
  doc.text(data.razaoSocial || data.clienteNome || "", pageWidth / 2, y + 12, { align: "center" });
  doc.setTextColor(...TEXT_COLOR);
  y += 18;

  // Date line
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  const now = new Date();
  doc.text(
    `Por: ${data.clienteNome} (${data.clienteEmail})`,
    margin,
    y
  );
  doc.text(
    `Em ${now.toLocaleDateString("pt-BR")} ${now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
    pageWidth - margin,
    y,
    { align: "right" }
  );
  y += 5;

  // === CLIENTE ===
  drawHeader("Cliente");
  drawTwoColumns("Nome", data.clienteNome, "E-mail", data.clienteEmail);
  drawTwoColumns("Razão Social", data.razaoSocial, "CNPJ", data.cnpj);
  drawTwoColumns("Endereço", data.endereco, "Informações", data.infoAdicionais);

  // === INFORMAÇÕES GERAIS ===
  drawHeader("Informações gerais");
  drawTwoColumns("Tipo de serviço", data.tipoServico, "Km veículo", data.kmVeiculo);
  drawRow("Localização GPS", data.localizacaoGps, 40);

  // === LISTA DE ATIVOS ===
  if (data.equipamentos.length > 0) {
    drawHeader("Lista de ativos");
    // Table header
    checkPageBreak(8);
    const cols = [
      { label: "Nome", w: contentWidth * 0.25 },
      { label: "Marca", w: contentWidth * 0.18 },
      { label: "Modelo", w: contentWidth * 0.18 },
      { label: "Nº de série", w: contentWidth * 0.2 },
      { label: "Informações", w: contentWidth * 0.19 },
    ];
    doc.setFillColor(...LIGHT_BG);
    doc.rect(margin, y, contentWidth, 7, "F");
    doc.setDrawColor(200, 200, 200);
    doc.rect(margin, y, contentWidth, 7, "S");
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    let cx = margin;
    cols.forEach((col) => {
      doc.text(col.label, cx + 2, y + 4.5);
      cx += col.w;
    });
    y += 7;

    data.equipamentos.forEach((eq) => {
      checkPageBreak(7);
      doc.setDrawColor(200, 200, 200);
      doc.rect(margin, y, contentWidth, 7, "S");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      let cx2 = margin;
      [eq.nome, eq.marca, eq.modelo, eq.numSerie, eq.informacoes].forEach((val, i) => {
        doc.text(val || "-", cx2 + 2, y + 4.5);
        cx2 += cols[i].w;
      });
      y += 7;
    });
  }

  // === PMOC ===
  if (data.mesReferencia || data.periodo) {
    drawHeader("Preventiva em Sistema AVAC-R nos equipamentos SPLIT");
    drawTwoColumns("Mês de referência", data.mesReferencia, "Período", data.periodo);

    // Filtros de ar
    checkPageBreak(8);
    doc.setFillColor(220, 220, 230);
    doc.rect(margin, y, contentWidth, 7, "F");
    doc.setDrawColor(200, 200, 200);
    doc.rect(margin, y, contentWidth, 7, "S");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("FILTROS DE AR", margin + 3, y + 5);
    y += 8;

    const formatStatus = (v: "conforme" | "nao_conforme" | null) =>
      v === "conforme" ? "Conforme" : v === "nao_conforme" ? "Não Conforme" : "-";

    const drawCheckRow = (text: string, status: string) => {
      checkPageBreak(7);
      const statusW = 30;
      doc.setDrawColor(200, 200, 200);
      doc.rect(margin, y, contentWidth - statusW, 7, "S");
      doc.rect(margin + contentWidth - statusW, y, statusW, 7, "S");
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.text(text, margin + 2, y + 4.5);
      doc.setFont("helvetica", "bold");
      if (status === "Conforme") doc.setTextColor(34, 139, 34);
      else if (status === "Não Conforme") doc.setTextColor(220, 50, 50);
      doc.text(status, margin + contentWidth - statusW + 2, y + 4.5);
      doc.setTextColor(...TEXT_COLOR);
      y += 7;
    };

    drawCheckRow("Limpar os elementos filtrantes e substituir em caso de avarias", formatStatus(data.checklist.filtrosAr.limparElementos));
    drawCheckRow("Verificar a fixação, corrigir o ajuste da moldura se necessário", formatStatus(data.checklist.filtrosAr.verificarFixacao));

    // Gabinetes
    checkPageBreak(8);
    doc.setFillColor(220, 220, 230);
    doc.rect(margin, y, contentWidth, 7, "F");
    doc.setDrawColor(200, 200, 200);
    doc.rect(margin, y, contentWidth, 7, "S");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("GABINETES", margin + 3, y + 5);
    y += 8;

    drawCheckRow("Verificar o mecanismo de renovação de ar", formatStatus(data.checklist.gabinetes.verificarRenovacao));
    drawCheckRow("Verificar botoeiras, knobs, etc. e repor, se necessário", formatStatus(data.checklist.gabinetes.verificarBotoeiras));
  }

  // === OCORRÊNCIA ===
  drawHeader("Problema identificado");
  checkPageBreak(15);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Relato do cliente", margin + 2, y + 4);
  y += 5;
  doc.setFont("helvetica", "normal");
  const probLines = doc.splitTextToSize(data.problemaIdentificado || "-", contentWidth - 4);
  checkPageBreak(probLines.length * 4 + 2);
  doc.text(probLines, margin + 2, y + 3);
  y += probLines.length * 4 + 4;

  drawHeader("Serviço realizado");
  checkPageBreak(15);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Descrição do serviço", margin + 2, y + 4);
  y += 5;
  doc.setFont("helvetica", "normal");
  const servLines = doc.splitTextToSize(data.servicoRealizado || "-", contentWidth - 4);
  checkPageBreak(servLines.length * 4 + 2);
  doc.text(servLines, margin + 2, y + 3);
  y += servLines.length * 4 + 4;

  // === FOTOS ===
  if (data.fotos.length > 0) {
    drawHeader("Fotos do serviço");
    const photoSize = 55;
    const gap = 5;
    const cols2 = Math.floor(contentWidth / (photoSize + gap));
    
    for (let i = 0; i < data.fotos.length; i++) {
      const col = i % cols2;
      if (col === 0 && i > 0) y += photoSize + gap;
      checkPageBreak(photoSize + gap);
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
    y += photoSize + gap;
  }

  // === ASSINATURA ===
  drawHeader("APROVAÇÃO");
  checkPageBreak(40);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Assinatura", margin + 2, y + 4);
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

  doc.save(`relatorio-${data.clienteNome || "visita"}-${now.toISOString().slice(0, 10)}.pdf`);
}
