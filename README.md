# NotaFlow

MVP de uma central de conferência para compras de restaurantes. Os itens extraídos por IA a partir de notas fiscais enviadas pelo WhatsApp chegam à fila para aprovação individual ou em lote.

## Recursos do MVP

- painel com itens pendentes, aprovados e restaurantes ativos;
- filtro por restaurante e seleção em lote;
- revisão individual com prévia da nota;
- edição de descrição e quantidade antes da aprovação;
- aprovação ou recusa individual;
- cadastro e visualização dos restaurantes do plano;
- persistência local para demonstração, usando `localStorage`;
- layout responsivo, pronto para hospedagem estática.

## Executar

Requer Node.js 20 ou superior:

```bash
npm install
npm run dev
```

Para validar a versão de produção:

```bash
npm run build
npm run preview
```

## Publicar na Hostinger

O projeto usa Vite, framework reconhecido automaticamente pelo deploy Node.js da Hostinger.

Ao importar este repositório, confirme:

- framework: `Vite`;
- comando de build: `npm run build`;
- diretório de saída: `dist`;
- versão do Node.js: `20.x`, `22.x` ou `24.x`.

Também é possível executar `npm run build` e enviar o conteúdo da pasta `dist` para `public_html`.

## Próxima etapa de produção

Substituir o `localStorage` por uma API com autenticação e banco de dados. A integração do WhatsApp grava os itens nessa API; a aprovação registra uma tarefa numa fila para o agente de automação instalado no computador do cliente.
