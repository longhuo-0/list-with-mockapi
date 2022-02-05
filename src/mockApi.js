import { createServer, Model } from 'miragejs';
import qs from 'qs';

export default function () {
  createServer({
    models: {
      user: Model,
    },
    seeds(server) {
      for (let i = 0; i < 100; i++) {
        server.create("user",
          {
            id: i,
            name: {
              first: `f_${i}`,
              last: `f_${i}`,
            },
            gender: i % 2 === 0 ? "female" : "male",
            email: `email_${i}@example.com`
          }
        )
      }
    },

    routes() {
      this.get("/api/users", (schema, request) => {
        let users, total
        let params = qs.parse(request.queryParams)
        console.log(params)
        if (params?.filters?.gender && params.filters?.gender?.length == 1 ){
          users = schema.users.where({gender: params.filters.gender[0]})
        }

        if (!users){
          users = schema.users.all()
          total = users.length
        }

        if (params.sortField && params.sortOrder){
          console.log("here")

          users = users.sort((a, b) => {
            if  (params.sortOrder == "ascend"){
              return a[params.sortField] > b[params.sortField] ? -1 : 1
            } else{
              return a[params.sortField] > b[params.sortField] ? -1 : 1
            }
          })
          console.log(users)
        }

        users = users.slice((params.pagination.current - 1) * params.pagination.pageSize, params.pagination.current * params.pagination.pageSize  )
        return {
          results: users.models,
          total: total,
          ...params.pagination
        }
      })
    }
  })
}
