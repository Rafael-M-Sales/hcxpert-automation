Feature: Login
  Como usuário do sistema
  Quero fazer login na plataforma
  Para acessar funcionalidades restritas

  Background:
    Given que estou na página de login

  @positive
  Scenario: Login válido com credenciais corretas
    When preencho o campo email com "teste2024@teste.com.br"
    And preencho o campo senha com "teste"
    And clico no botão Login
    Then devo ser redirecionado para a página inicial
    And devo ver a mensagem "Logged in as"

  @negative
  Scenario: Login inválido com credenciais incorretas
    When preencho o campo email com "invalido@email.com"
    And preencho o campo senha com "senhaerrada"
    And clico no botão Login
    Then devo ver a mensagem de erro "Your email or password is incorrect!"
