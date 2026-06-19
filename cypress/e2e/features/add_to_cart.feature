Feature: Adicionar Produto ao Carrinho
  Como usuário do sistema
  Quero adicionar produtos ao carrinho
  Para realizar compras

  Background:
    Given que estou logado no sistema
    And que estou na página de produtos

  @positive
  Scenario: Adicionar produto ao carrinho com sucesso
    When visualizo e adiciono o primeiro produto ao carrinho
    Then o produto deve ser adicionado ao carrinho com sucesso

  @negative
  Scenario: Tentar adicionar produto sem estar logado
    Given que estou na página de produtos sem estar logado
    When visualizo e adiciono o primeiro produto ao carrinho
    Then o produto é adicionado ao carrinho como visitante
