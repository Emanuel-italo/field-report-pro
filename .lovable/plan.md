

# Relatório de Visita Técnica / PMOC - Cruztech Assistência

Aplicativo web mobile-first para técnicos em campo preencherem relatórios de visita técnica e gerarem PDFs profissionais.

## Identidade Visual
- **Cores**: Azul Marinho (#0a1f3d do logo), Branco e Cinza
- **Logo**: Cruztech Assistência no topo do app e no cabeçalho do PDF
- **Interface**: Moderna, limpa, otimizada para celular

## Estrutura do Formulário (em Accordions)

### 1. Cliente e Empresa
- Nome, E-mail, Razão Social, CNPJ, Endereço, Informações adicionais (ex: Síndico)

### 2. Informações Gerais
- Tipo de serviço (seleção: Instalação, Manutenção Preventiva, Manutenção Corretiva, Visita Técnica)
- Km do veículo
- Botão "Obter Localização GPS" (preenchimento automático via navegador)

### 3. Lista de Ativos (dinâmica)
- Botão "Adicionar Equipamento"
- Cada equipamento: Nome, Marca, Modelo, Número de Série, Informações (ex: BTUs)
- Possibilidade de remover equipamentos

### 4. Preventiva PMOC
- Mês de referência e Período
- **Checklist Filtros de Ar** (2 itens com botões Conforme/Não Conforme):
  - Limpar elementos filtrantes e substituir em caso de avarias
  - Verificar fixação, corrigir o ajuste da moldura se necessário
- **Checklist Gabinetes** (2 itens com botões Conforme/Não Conforme):
  - Verificar mecanismo de renovação de ar
  - Verificar botoeiras, knobs, etc. e repor se necessário

### 5. Ocorrência
- Problema identificado (relato do cliente) — campo de texto grande
- Serviço realizado (descrição) — campo de texto grande

### 6. Fotos do Serviço
- Botão para tirar foto (câmera) ou anexar da galeria
- Miniaturas das fotos adicionadas com opção de remover
- Suporte a múltiplas fotos (antes/depois)

### 7. Aprovação
- Canvas para assinatura digital com o dedo na tela
- Botão para limpar assinatura

## Ação Final
- Botão grande **"Concluir e Gerar PDF"**
- PDF gerado no navegador com layout em tabelas profissional (conforme imagem de referência)
- Cabeçalhos coloridos em roxo/azul, estrutura idêntica ao modelo fornecido
- Inclui logo, dados do cliente, ativos, checklist, fotos e assinatura
- Download automático do PDF

## Tecnologias
- Formulário 100% client-side (sem backend necessário)
- Biblioteca jsPDF + html2canvas para geração do PDF
- Canvas HTML5 para assinatura digital
- API de Geolocalização do navegador para GPS
- Input de câmera/galeria nativo do celular

