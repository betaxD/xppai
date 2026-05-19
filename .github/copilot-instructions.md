# Copilot Instructions — XppAI / AX 2009

Este repositório usa o xppai skill suite para análise e desenvolvimento em
Microsoft Dynamics AX 2009 (X++). As skills ficam em `.github/skills/`.

## Contexto do Projeto

- Plataforma: Microsoft Dynamics AX 2009
- Linguagem: X++
- Camadas customizadas: VAR, CUS, USR
- Skills disponíveis: xppai-papai, xppai-codefix, xppai-risk, xppai-support,
  xppai-explain, xppai-architect, xppai-posting, xppai-stack, xppai-babysit

## Regras Sempre Ativas

- Nunca modificar código dentro de blocos de localização: `<GBR>`, `<GIN>`,
  `<GJP>`, `<GSA>`, `<GTH>`. São de propriedade da Microsoft.
- AX 2009 apenas. Não sugerir recursos de D365 ou AX moderno.
- Declarações de variáveis sempre no topo do método.
- Usar labels de evidência: Confirmado (no código) / Provável (inferido) /
  Desconhecido (contexto ausente).

---

## Protocolo de Memória — AX 2009

Quando o usuário pedir "salva como memória", "guarda isso" ou "salva no Copilot",
emita o bloco correspondente formatado exatamente como abaixo.
Após emitir, diga: _"Copie este bloco e cole em: Copilot → Memory → Save."_

---

### Objeto AX

Use quando um objeto específico foi explorado, analisado ou modificado.

```
XPPAI-OBJETO: <Classe | Tabela | Form | Enum — nome exato>
Camada: <SYS | VAR | CUS | USR>
Propósito: <uma linha descrevendo o que o objeto faz>
Customizações: <métodos alterados e o que cada um faz>
Problemas conhecidos: <Confirmado | Provável | Desconhecido — descrição>
Última análise: <DD/MM/YYYY> — <dev>
```

---

### Processo de Negócio

Use quando um fluxo end-to-end foi mapeado (ex: posting de NF, reserva de estoque).

```
XPPAI-PROCESSO: <nome do processo de negócio>
Objetos envolvidos: <lista separada por vírgula>
Entry point: <Classe.método>
Boundary transacional: <onde fica ttsbegin / ttscommit>
Customizações ativas: <Sim — quais | Não>
Riscos mapeados: <Confirmado | Provável | Desconhecido — descrição>
Última análise: <DD/MM/YYYY> — <dev>
```

---

### Projeto / Suporte

Use durante desenvolvimento de projeto ou encerramento de chamado de suporte.

```
XPPAI-PROJETO: <nome do projeto ou descrição do chamado>
Tag ID / Project ID: <código — ou N/A>
Dev responsável: <nome>
Objetos tocados: <lista separada por vírgula>
Status: <Em andamento | Concluído | Bloqueado>
Risco de regressão: <áreas ou objetos que podem ser afetados>
Data: <DD/MM/YYYY>
```

---

## Uso da Memória nas Sessões

No início de cada sessão, aplique automaticamente qualquer memória salva
(`XPPAI-OBJETO`, `XPPAI-PROCESSO`, `XPPAI-PROJETO`) como contexto ativo.
Não peça ao usuário para reexplicar o que já está na memória.

Se um objeto ou processo mencionado tiver entrada de memória salva,
cite os dados salvos antes de responder — sinalizando de onde vem a informação.
