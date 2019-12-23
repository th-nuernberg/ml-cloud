Die Verwendung der API erfordert eine Authentifizierung. Wir benutzen momentan BasicAuth, welches **Passwörter im Klartext** überträgt.

Um einen neuen Benutzer zu erstellen, ist eine POST-Anfrage auf /users erforderlich.
Diese muss Benutzernamen und Passwort enthalten, wie z.B.:

```
{
    "username" : "Foo",
    "password" : "Bar"
}
```