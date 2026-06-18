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

Abra `index.html` diretamente ou use um servidor local:

```bash
npx serve .
```

## Publicar na Hostinger

Envie `index.html`, `styles.css` e `app.js` para a pasta `public_html`, ou conecte este repositório pelo recurso de deploy Git da Hostinger.

## Próxima etapa de produção

Substituir o `localStorage` por uma API com autenticação e banco de dados. A integração do WhatsApp grava os itens nessa API; a aprovação registra uma tarefa numa fila para o agente de automação instalado no computador do cliente.
