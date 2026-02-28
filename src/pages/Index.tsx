import React, { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  FileDown,
  User,
  Wrench,
  DollarSign,
  Camera,
  PenTool,
} from "lucide-react";
import SignatureCanvas from "@/components/SignatureCanvas";
import PhotoUpload from "@/components/PhotoUpload";
import { generatePdf, type FormData } from "@/lib/generatePdf";
import { useToast } from "@/hooks/use-toast";
import cruztechLogo from "@/assets/cruztech-logo.jpg";

// === DEFINA SUAS CORES DO LOGO AQUI (HEX) ===
const COLORS = {
  primary: "#0A4B5E", // Azul Petróleo
  accent: "#F9A826", // Laranja Vibrante
  text: "#1A1A1A", // Texto Principal
  background: "#F0F8FA", // Um tom muito claro de azul
};

const Index = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Form states
  const [nomeCliente, setNomeCliente] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [numSerie, setNumSerie] = useState("");
  const [pecaTrocada, setPecaTrocada] = useState("");
  const [pecaAtencao, setPecaAtencao] = useState("");
  const [valorPeca, setValorPeca] = useState("");
  const [valorPago, setValorPago] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("");
  
  const [fotos, setFotos] = useState<string[]>([]);
  const [assinatura, setAssinatura] = useState<string | null>(null);

  const getLogoBase64 = (): Promise<string | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/jpeg"));
        } else {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = cruztechLogo;
    });
  };

  const handleGeneratePdf = async () => {
    setLoading(true);
    try {
      const logoBase64 = await getLogoBase64();
      const formData: FormData = {
        nomeCliente,
        marca,
        modelo,
        numSerie,
        pecaTrocada,
        pecaAtencao,
        valorPeca,
        valorPago,
        formaPagamento,
        fotos,
        assinatura,
      };
      await generatePdf(formData, logoBase64);
      toast({ title: "PDF gerado com sucesso!", description: "O download deve iniciar automaticamente." });
    } catch (err) {
      toast({ title: "Erro ao gerar PDF", description: "Tente novamente.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = "mt-1.5";

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.background, color: COLORS.text }}>
      {/* Header com cor primária e destaque */}
      <header className="sticky top-0 z-50 shadow-lg" style={{ backgroundColor: COLORS.primary, color: "#fff" }}>
        <div className="flex items-center gap-3 px-4 py-3 max-w-lg mx-auto">
          <img src={cruztechLogo} alt="Cruztech" className="h-10 w-10 rounded-lg object-cover bg-white/10" />
          <div className="grow">
            <h1 className="text-base font-bold leading-tight">Cruztech Assistência</h1>
            <p className="text-xs text-white/70">CNPJ: 63.087.545/0001-05</p>
          </div>
          {/* Um detalhe na cor de destaque */}
          <div className="w-1.5 h-10 rounded-full" style={{ backgroundColor: COLORS.accent }}></div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-lg mx-auto px-4 py-4 pb-32">
        <Accordion type="multiple" defaultValue={["cliente", "equipamento", "servico", "fotos", "aprovacao"]} className="space-y-3">

          {/* 1. Cliente */}
          <AccordionItem value="cliente" className="border rounded-xl overflow-hidden bg-card shadow-sm">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: COLORS.primary }}>
                <User className="h-4 w-4" style={{ color: COLORS.primary }} />
                Cliente
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-3">
              <div>
                <Label className="text-xs" style={{ color: COLORS.primary }}>Nome do Cliente</Label>
                <Input className={fieldClass} placeholder="Nome completo" value={nomeCliente} onChange={(e) => setNomeCliente(e.target.value)} />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 2. Equipamento */}
          <AccordionItem value="equipamento" className="border rounded-xl overflow-hidden bg-card shadow-sm">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: COLORS.primary }}>
                <Wrench className="h-4 w-4" style={{ color: COLORS.primary }} />
                Equipamento
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs" style={{ color: COLORS.primary }}>Marca</Label>
                  <Input className={fieldClass} placeholder="Ex: Samsung" value={marca} onChange={(e) => setMarca(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs" style={{ color: COLORS.primary }}>Modelo</Label>
                  <Input className={fieldClass} placeholder="Ex: Inverter" value={modelo} onChange={(e) => setModelo(e.target.value)} />
                </div>
              </div>
              <div>
                <Label className="text-xs" style={{ color: COLORS.primary }}>N° Série</Label>
                <Input className={fieldClass} placeholder="Número de série" value={numSerie} onChange={(e) => setNumSerie(e.target.value)} />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 3. Serviço e Valores */}
          <AccordionItem value="servico" className="border rounded-xl overflow-hidden bg-card shadow-sm">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: COLORS.primary }}>
                <DollarSign className="h-4 w-4" style={{ color: COLORS.primary }} />
                Serviço e Pagamento
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-3">
              <div>
                <Label className="text-xs" style={{ color: COLORS.primary }}>Peça Trocada</Label>
                <Input className={fieldClass} placeholder="Qual peça foi substituída?" value={pecaTrocada} onChange={(e) => setPecaTrocada(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs" style={{ color: COLORS.primary }}>Peça a deixar com atenção</Label>
                <Input className={fieldClass} placeholder="Ex: Correia desgastada" value={pecaAtencao} onChange={(e) => setPecaAtencao(e.target.value)} />
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div>
                  <Label className="text-xs" style={{ color: COLORS.primary }}>Valor da Peça</Label>
                  <Input className={fieldClass} placeholder="R$ 0,00" value={valorPeca} onChange={(e) => setValorPeca(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs" style={{ color: COLORS.primary }}>Valor Pago</Label>
                  <Input className={fieldClass} placeholder="R$ 0,00" value={valorPago} onChange={(e) => setValorPago(e.target.value)} />
                </div>
              </div>
              <div>
                <Label className="text-xs" style={{ color: COLORS.primary }}>Forma de Pagamento</Label>
                <Input className={fieldClass} placeholder="Ex: PIX, Cartão, Dinheiro" value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)} />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 4. Fotos */}
          <AccordionItem value="fotos" className="border rounded-xl overflow-hidden bg-card shadow-sm">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: COLORS.primary }}>
                <Camera className="h-4 w-4" style={{ color: COLORS.primary }} />
                Fotos do Reparo {fotos.length > 0 && `(${fotos.length})`}
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <PhotoUpload photos={fotos} onPhotosChange={setFotos} />
            </AccordionContent>
          </AccordionItem>

          {/* 5. Aprovação */}
          <AccordionItem value="aprovacao" className="border rounded-xl overflow-hidden bg-card shadow-sm">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: COLORS.primary }}>
                <PenTool className="h-4 w-4" style={{ color: COLORS.primary }} />
                Assinatura do Cliente
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <SignatureCanvas onSignatureChange={setAssinatura} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </main>

      {/* Botão fixo no final com cor primária e texto de destaque */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg p-4 z-50">
        <div className="max-w-lg mx-auto">
          <Button
            className="w-full h-12 text-base font-bold shadow-md"
            style={{ backgroundColor: COLORS.primary, color: COLORS.accent }}
            onClick={handleGeneratePdf}
            disabled={loading}
          >
            <FileDown className="h-5 w-5 mr-2" />
            {loading ? "Gerando PDF..." : "Concluir e Gerar PDF"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;