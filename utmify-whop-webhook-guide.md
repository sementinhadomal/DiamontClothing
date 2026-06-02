# Guia de Integração Webhook: Whop -> Utmify

Este documento explica como integrar as vendas da plataforma **Whop** com o rastreamento da **Utmify** utilizando a chave de API fornecida: `qWR5tZDJ2xyQ7h6VZyAPqYZD68ipekums4Hl`.

---

## Como Funciona o Rastreamento

### 1. Rastreamento Principal (Via Navegador - Já Configurado)
A página de agradecimento já possui a integração do Pixel da Utmify e o script de UTMs ativos com a sua chave de pixel `6a1e39c0710d91ec4444583a`. 
Quando o cliente finaliza a compra no Whop e é redirecionado para a página de agradecimento com os parâmetros corretos na URL:
`https://diamont-clothing.vercel.app/thank-you.html?id={id}&email={email}&name={username}&price=29.99&currency=USD`

O navegador executa automaticamente o evento de compra (`Purchase`) e a Utmify captura esse evento associando-o aos cookies de UTM que o cliente possuía ao entrar no site. **Essa etapa é o suficiente para rastrear a maioria das vendas do Meta Ads.**

---

## 2. Rastreamento por Webhook (Backup Servidor-para-Servidor)

Como o Whop não possui integração direta na lista da Utmify e os formatos de dados (payloads) enviados pelas duas plataformas são diferentes, você não deve colar a URL da Utmify diretamente no Whop. É necessário utilizar um integrador intermediário (como **Make.com** ou **Zapier**) para atuar como ponte.

### Passo a Passo no Integrador (ex: Make.com)

#### Passo A: Receber o evento do Whop
1. Crie um novo cenário no Make.com.
2. Adicione o módulo **Webhooks** -> **Custom Webhook**.
3. Copie a URL gerada e configure-a no painel do **Whop** (Configurações de Desenvolvedor -> Webhooks) para escutar o evento `payment.succeeded`.
4. Faça uma compra de teste no Whop para preencher a estrutura dos dados no Make.

#### Passo B: Enviar os dados formatados para a Utmify
1. Adicione um novo módulo do tipo **HTTP** -> **Make a Request**.
2. Configure a requisição HTTP com as seguintes propriedades:
   - **Method**: `POST`
   - **URL**: `https://api.utmify.com.br/api-credentials/orders`
   - **Headers**:
     - `x-api-token`: `qWR5tZDJ2xyQ7h6VZyAPqYZD68ipekums4Hl`
     - `Content-Type`: `application/json`
   - **Body Type**: `Raw`
   - **Content Type**: `JSON (application/json)`
   - **Request Content** (JSON formatado que a Utmify espera):

```json
{
  "orderId": "{{1.action.data.id}}", 
  "platform": "Whop",
  "paymentMethod": "credit_card",
  "status": "paid",
  "createdAt": "{{1.action.data.created_at}}",
  "approvedDate": "{{1.action.data.created_at}}",
  "refundedAt": null,
  "customer": {
    "name": "{{1.action.data.user.username}}",
    "email": "{{1.action.data.user.email}}",
    "phone": "",
    "document": ""
  },
  "products": [
    {
      "id": "{{1.action.data.product.id}}",
      "name": "9 pack stretch trunks",
      "price": 29.99,
      "quantity": 1,
      "planId": "{{1.action.data.plan.id}}",
      "planName": "9 pack stretch trunks plan",
      "priceInCents": 2999
    }
  ],
  "trackingParameters": {
    "utm_source": "",
    "utm_medium": "",
    "utm_campaign": "",
    "utm_content": "",
    "utm_term": ""
  },
  "commission": {
    "value": 29.99,
    "totalPriceInCents": 2999,
    "gatewayFeeInCents": 200,
    "userCommissionInCents": 2799,
    "currency": "USD"
  },
  "isTest": false
}
```

*Nota: Substitua os campos dinâmicos `{{...}}` pelas variáveis correspondentes retornadas pelo gatilho do Whop no Make.*

---

## Benefícios Desta Estrutura
- **Confiabilidade**: O pixel no navegador captura a venda instantaneamente associando as UTMs corretas de tráfego direto do cliente.
- **Segurança**: O webhook configurado via intermediário assegura o envio do evento mesmo se o cliente fechar a janela antes do redirecionamento carregar.

---

## 3. Meta Conversions API (CAPI) - Rastreamento Servidor-a-Servidor

O **token do CAPI** permite enviar eventos de compra diretamente da Meta **pelo servidor**, sem depender do navegador do cliente. Isso melhora muito a precisão do rastreamento (contorna bloqueadores de anúncios e iOS 14+).

> ⚠️ **NUNCA coloque esse token no código HTML/JS da página** — ele é secreto e ficaria visível a qualquer pessoa que inspecionasse o site.

### Como usar no Make.com (Passo C adicional):

Após o Passo B (envio para Utmify), adicione mais um módulo **HTTP** -> **Make a Request** no seu cenário do Make.com:

- **Method**: `POST`
- **URL**: `https://graph.facebook.com/v20.0/1014024587850948/events`
- **Query String Parameters**:
  - `access_token`: `EAGDz8azhHSABRpNJc2mBwXwHEZCmk6io6T8QgQ7iHRpLL9IZAvD7SQ33b6ZCZCqeaYSyZBkknfJYpZC25vXEeAuSJrxEy7ZCXhlDzk7DL2RUyp1JZABodEuTdC2lqEyjaoK60xT2SsJOXcbV4FZBv0I1PZAI9DMTCMGzVgPQ1wKN4WfQX39thoLRz9bmICVWH8fwZDZD`
- **Body Type**: `Raw`
- **Content Type**: `JSON (application/json)`
- **Request Content**:

```json
{
  "data": [
    {
      "event_name": "Purchase",
      "event_time": "{{timestamp}}",
      "action_source": "website",
      "user_data": {
        "em": ["{{sha256(toLowerCase(customer.email))}}"],
        "client_user_agent": "{{userAgent}}"
      },
      "custom_data": {
        "currency": "USD",
        "value": 29.99,
        "content_name": "9 pack stretch trunks",
        "content_type": "product",
        "order_id": "{{orderId}}"
      }
    }
  ]
}
```

*Nota: O Make.com possui módulo nativo de hash SHA256 para anonimizar o e-mail antes de enviar para a Meta conforme exigido pelas políticas de privacidade.*

### Resumo do Fluxo Completo no Make.com:
```
[Whop Webhook] → [HTTP: Utmify] → [HTTP: Meta CAPI]
```

Com esse fluxo triplo, cada venda é rastreada com máxima redundância e precisão.

