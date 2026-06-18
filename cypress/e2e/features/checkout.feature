Feature: Validar Produtos no Carrinho e Finalizar Compra
  Como usuário do sistema
  Quero validar os produtos no carrinho
  Para confirmar minha compra antes de finalizar

  Background:
    Given que estou logado no sistema
    And que estou na página de produtos
    And adiciono o primeiro produto ao carrinho

  @positive
  Scenario: Validar produto no carrinho na tela de pagamento
    When acesso o carrinho de compras
    Then devo ver o produto adicionado na lista do carrinho
    And o nome e preço do produto devem estar corretos

  @positive
  Scenario: Finalizar compra com produto no carrinho
    When acesso o carrinho de compras
    And clico em "Proceed To Checkout"
    Then devo ser direcionado para a tela de pagamento
    And devo ver o resumo do pedido com o produto
