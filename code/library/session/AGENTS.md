# Контекст сессии витрины

@library/session содержит только SessionContextInterface и публичную VisitorSession. Host-owned SessionService реализует порт и остается владельцем session/bootstrap/login/logout. Другие packages используют getCurrent/subscribe/issueSocketTicket без импорта host implementation. Секрет сессии хранится в cookie и не входит в этот порт. Ticket запрашивается через Client Gateway пассивно, без продления гостя.
