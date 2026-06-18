Feature: Busca de Produtos
  Como usuário do sistema
  Quero buscar produtos
  Para encontrar itens específicos

  Background:
    Given que estou na página de produtos

  @positive
  Scenario: Buscar produto existente
    When busco pelo produto "Blue Top"
    Then devo ver resultados de busca para "Blue Top"

  @negative
  Scenario: Buscar produto inexistente
    When busco pelo produto "ProdutoInexistenteXYZ123"
    Then não deve haver resultados de busca
