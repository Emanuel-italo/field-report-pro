import React, { useState, useCallback } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Plus,
  Trash2,
  FileDown,
  Building2,
  Wrench,
  ClipboardList,
  AlertTriangle,
  Camera,
  PenTool,
  Settings,
} from "lucide-react";
import SignatureCanvas from "@/components/SignatureCanvas";
import PhotoUpload from "@/components/PhotoUpload";
import ChecklistItem from "@/components/ChecklistItem";
import { generatePdf, type FormData } from "@/lib/generatePdf";
import { useToast } from "@/hooks/use-toast";
import cruztechLogo from "@/assets/cruztech-logo.jpg";

const INITIAL_EQUIPAMENTO = { nome: "", marca: "", modelo: "", numSerie: "", informacoes: "" };

const Index = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Form state
  const [clienteNome, setClienteNome] = useState("");
  const [clienteEmail, setClienteEmail] = useState("");
  const [razaoSocial, setRazaoSocial] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [endereco, setEndereco] = useState("");
  const [infoAdicionais, setInfoAdicionais] = useState("");

  const [tipoServico, setTipoServico] = useState("");
  const [kmVeiculo, setKmVeiculo] = useState("");
  const [localizacaoGps, setLocalizacaoGps] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);

  const [equipamentos, setEquipamentos] = useState([{ ...INITIAL_EQUIPAMENTO }]);

  const [mesReferencia, setMesReferencia] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [checklist, setChecklist] = useState({
    filtrosAr: {
      limparElementos: null as "conforme" | "nao_conforme" | null,
      verificarFixacao: null as "conforme" | "nao_conforme" | null,
    },
    gabinetes: {
      verificarRenovacao: null as "conforme" | "nao_conforme" | null,
      verificarBotoeiras: null as "conforme" | "nao_conforme" | null,
    },
  });

  const [problemaIdentificado, setProblemaIdentificado] = useState("");
  const [servicoRealizado, setServicoRealizado] = useState("");
  const [fotos, setFotos] = useState<string[]>([]);
  const [assinatura, setAssinatura] = useState<string | null>(null);

  const getGpsLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast({ title: "GPS não disponível", description: "Seu navegador não suporta geolocalização.", variant: "destructive" });
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`;
        setLocalizacaoGps(coords);
        setGpsLoading(false);
        toast({ title: "Localização obtida!", description: coords });
      },
      () => {
        setGpsLoading(false);
        toast({ title: "Erro ao obter GPS", description: "Permita o acesso à localização.", variant: "destructive" });
      },
      { enableHighAccuracy: true }
    );
  }, [toast]);

  const addEquipamento = () => setEquipamentos([...equipamentos, { ...INITIAL_EQUIPAMENTO }]);
  const removeEquipamento = (i: number) => {
    if (equipamentos.length <= 1) return;
    setEquipamentos(equipamentos.filter((_, idx) => idx !== i));
  };
  const updateEquipamento = (i: number, field: string, value: string) => {
    const updated = [...equipamentos];
    (updated[i] as any)[field] = value;
    setEquipamentos(updated);
  };

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
        clienteNome, clienteEmail, razaoSocial, cnpj, endereco, infoAdicionais,
        tipoServico, kmVeiculo, localizacaoGps,
        equipamentos, mesReferencia, periodo, checklist,
        problemaIdentificado, servicoRealizado, fotos, assinatura,
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
        <div className="flex items-center gap-3 px-4 py-3 max-w-lg mx-auto">
          <img src={cruztechLogo} alt="Cruztech" className="h-10 w-10 rounded-lg object-cover bg-primary-foreground/10" />
          <div>
            <h1 className="text-base font-bold leading-tight">Cruztech Assistência</h1>
            <p className="text-xs text-primary-foreground/70">Relatório de Visita Técnica / PMOC</p>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-lg mx-auto px-4 py-4 pb-32">
        <Accordion type="multiple" defaultValue={["cliente"]} className="space-y-3">

          {/* 1. Cliente e Empresa */}
          <AccordionItem value="cliente" className="border rounded-xl overflow-hidden bg-card shadow-sm">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Building2 className="h-4 w-4 text-primary" />
                Cliente e Empresa
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-3">
              <div>
                <Label className="text-xs">Nome</Label>
                <Input className={fieldClass} placeholder="Nome do cliente" value={clienteNome} onChange={(e) => setClienteNome(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">E-mail</Label>
                <Input className={fieldClass} type="email" placeholder="email@exemplo.com" value={clienteEmail} onChange={(e) => setClienteEmail(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Razão Social</Label>
                <Input className={fieldClass} placeholder="Razão Social" value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">CNPJ</Label>
                <Input className={fieldClass} placeholder="00.000.000/0000-00" value={cnpj} onChange={(e) => setCnpj(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Endereço</Label>
                <Input className={fieldClass} placeholder="Endereço completo" value={endereco} onChange={(e) => setEndereco(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Informações adicionais</Label>
                <Input className={fieldClass} placeholder="Ex: Síndico Marcelo" value={infoAdicionais} onChange={(e) => setInfoAdicionais(e.target.value)} />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 2. Informações Gerais */}
          <AccordionItem value="info" className="border rounded-xl overflow-hidden bg-card shadow-sm">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Settings className="h-4 w-4 text-primary" />
                Informações Gerais
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-3">
              <div>
                <Label className="text-xs">Tipo de Serviço</Label>
                <Select value={tipoServico} onValueChange={setTipoServico}>
                  <SelectTrigger className={fieldClass}>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Instalação">Instalação</SelectItem>
                    <SelectItem value="Manutenção Preventiva">Manutenção Preventiva</SelectItem>
                    <SelectItem value="Manutenção Corretiva">Manutenção Corretiva</SelectItem>
                    <SelectItem value="Visita Técnica">Visita Técnica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Km do Veículo</Label>
                <Input className={fieldClass} placeholder="Ex: 45.230" value={kmVeiculo} onChange={(e) => setKmVeiculo(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Localização GPS</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input className="flex-1" placeholder="Latitude, Longitude" value={localizacaoGps} onChange={(e) => setLocalizacaoGps(e.target.value)} readOnly />
                  <Button type="button" size="sm" onClick={getGpsLocation} disabled={gpsLoading} className="shrink-0">
                    <MapPin className="h-4 w-4 mr-1" />
                    {gpsLoading ? "..." : "GPS"}
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 3. Lista de Ativos */}
          <AccordionItem value="ativos" className="border rounded-xl overflow-hidden bg-card shadow-sm">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Wrench className="h-4 w-4 text-primary" />
                Lista de Ativos ({equipamentos.length})
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              {equipamentos.map((eq, i) => (
                <div key={i} className="rounded-lg border bg-secondary/30 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">Equipamento {i + 1}</span>
                    {equipamentos.length > 1 && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeEquipamento(i)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  <Input placeholder="Nome" value={eq.nome} onChange={(e) => updateEquipamento(i, "nome", e.target.value)} />
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Marca" value={eq.marca} onChange={(e) => updateEquipamento(i, "marca", e.target.value)} />
                    <Input placeholder="Modelo" value={eq.modelo} onChange={(e) => updateEquipamento(i, "modelo", e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Nº de série" value={eq.numSerie} onChange={(e) => updateEquipamento(i, "numSerie", e.target.value)} />
                    <Input placeholder="Info (ex: BTUs)" value={eq.informacoes} onChange={(e) => updateEquipamento(i, "informacoes", e.target.value)} />
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" className="w-full" onClick={addEquipamento}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Equipamento
              </Button>
            </AccordionContent>
          </AccordionItem>

          {/* 4. Preventiva PMOC */}
          <AccordionItem value="pmoc" className="border rounded-xl overflow-hidden bg-card shadow-sm">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <ClipboardList className="h-4 w-4 text-primary" />
                Preventiva PMOC
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Mês de Referência</Label>
                  <Input className={fieldClass} placeholder="Ex: Março" value={mesReferencia} onChange={(e) => setMesReferencia(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Período</Label>
                  <Input className={fieldClass} placeholder="Ex: Mensal" value={periodo} onChange={(e) => setPeriodo(e.target.value)} />
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-primary mb-1">FILTROS DE AR</h4>
                <ChecklistItem
                  label="Limpar os elementos filtrantes e substituir em caso de avarias"
                  value={checklist.filtrosAr.limparElementos}
                  onChange={(v) => setChecklist({ ...checklist, filtrosAr: { ...checklist.filtrosAr, limparElementos: v } })}
                />
                <ChecklistItem
                  label="Verificar a fixação, corrigir o ajuste da moldura se necessário"
                  value={checklist.filtrosAr.verificarFixacao}
                  onChange={(v) => setChecklist({ ...checklist, filtrosAr: { ...checklist.filtrosAr, verificarFixacao: v } })}
                />
              </div>

              <div>
                <h4 className="text-xs font-bold text-primary mb-1">GABINETES</h4>
                <ChecklistItem
                  label="Verificar o mecanismo de renovação de ar"
                  value={checklist.gabinetes.verificarRenovacao}
                  onChange={(v) => setChecklist({ ...checklist, gabinetes: { ...checklist.gabinetes, verificarRenovacao: v } })}
                />
                <ChecklistItem
                  label="Verificar botoeiras, knobs, etc. e repor, se necessário"
                  value={checklist.gabinetes.verificarBotoeiras}
                  onChange={(v) => setChecklist({ ...checklist, gabinetes: { ...checklist.gabinetes, verificarBotoeiras: v } })}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 5. Ocorrência */}
          <AccordionItem value="ocorrencia" className="border rounded-xl overflow-hidden bg-card shadow-sm">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <AlertTriangle className="h-4 w-4 text-primary" />
                Ocorrência
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-3">
              <div>
                <Label className="text-xs">Problema Identificado (Relato do Cliente)</Label>
                <Textarea className={fieldClass} rows={4} placeholder="Descreva o problema relatado pelo cliente..." value={problemaIdentificado} onChange={(e) => setProblemaIdentificado(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Serviço Realizado</Label>
                <Textarea className={fieldClass} rows={4} placeholder="Descreva o serviço executado..." value={servicoRealizado} onChange={(e) => setServicoRealizado(e.target.value)} />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 6. Fotos */}
          <AccordionItem value="fotos" className="border rounded-xl overflow-hidden bg-card shadow-sm">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Camera className="h-4 w-4 text-primary" />
                Fotos do Serviço {fotos.length > 0 && `(${fotos.length})`}
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <PhotoUpload photos={fotos} onPhotosChange={setFotos} />
            </AccordionContent>
          </AccordionItem>

          {/* 7. Aprovação */}
          <AccordionItem value="aprovacao" className="border rounded-xl overflow-hidden bg-card shadow-sm">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <PenTool className="h-4 w-4 text-primary" />
                Aprovação (Assinatura)
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <SignatureCanvas onSignatureChange={setAssinatura} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </main>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg p-4 z-50">
        <div className="max-w-lg mx-auto">
          <Button
            className="w-full h-12 text-base font-bold shadow-md"
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
