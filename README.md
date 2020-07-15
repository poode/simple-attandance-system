
### NOTE

This is the report query but inside the code it is built by sequelize query

`SELECT COUNT(*), users.username FROM attendances JOIN users ON attendances.userId = users.id WHERE attendances.createdAt BETWEEN '2020-07-01' AND '2020-07-31' GROUP BY users.username`

[Postman Collection. import it in Postman Application](https://www.getpostman.com/collections/3cd8c2a568b6972444a1)
