<template>
  <section class="page-section">
    <b-container>
      <HeaderPage title="Gestão de Animais" />
      <!--MENU TOPO-->
      <b-row class="mb-4">

        <b-col cols="12" lg="10" xl="10" class="mx-auto">
          <router-link
            :to="{name:'addAnimal'}"
            tag="button"
            class="btn btn-outline-success mr-2 mt-2"
          >
            <i class="fas fa-plus-square"></i> ADICIONAR ANIMAL
          </router-link>
          <router-link :to="{name:'admin'}" tag="button" class="btn btn-outline-info mr-2 mt-2">
            <i class="fas fa-bars"></i> MENU PRINCIPAL
          </router-link>
        </b-col>

      </b-row>

      <!--TABLE-->
      <b-row>

        <b-col cols="12" lg="10" xl="10" class="mx-auto">
          <div class="list-table-scroll" role="region" aria-label="Tabela de registos" tabindex="0">
          <table class="table table-striped">
            <thead class="thead-dark">
              <tr>
                <th scope="col">
                  NOME
                  <i class="fas fa-arrow-up" v-if="sortType===1" @click="sort()"></i>
                  <i class="fas fa-arrow-down" v-else @click="sort()"></i>
                </th>
                <th scope="col">GRUPO</th>
                <th scope="col">NÍVEL</th>
                <th scope="col">AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="animal of animals" :key="animal._id">
                <td class="pt-4">{{animal.name}}</td>
                <td class="pt-4">{{animal.group}}</td>
                <td class="pt-4">{{animal.level}}</td>
                <td>
                  <router-link
                    :to="{name:'editAnimal', params:{animalId: animal._id}}"
                    tag="button"
                    class="btn btn-outline-success mr-2 mt-2"
                  >
                    <i class="fas fa-edit"></i> EDITAR
                  </router-link>
                  <button
                    @click="viewAnimal(animal._id)"
                    type="button"
                    class="btn btn-outline-success mr-2 mt-2"
                  >
                    <i class="fas fa-search"></i> VER
                  </button>
                  <button
                    @click="removeAnimal(animal._id)"
                    type="button"
                    class="btn btn-outline-danger mr-2 mt-2"
                  >
                    <i class="fas fa-trash-alt"></i> REMOVER
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          </div>
        </b-col>

      </b-row>
    </b-container>
  </section>
</template>

<script>
import { FETCH_ANIMALS, REMOVE_ANIMAL } from "@/store/animals/animal.constants";
import HeaderPage from "@/components/HeaderPage.vue";
import { mapGetters } from "vuex";

export default {
  name: "ManageAnimals",
  components: {
    HeaderPage
  },
  data: function() {
    return {
      animals: [],
      sortType: 1
    };
  },
  computed: {
    ...mapGetters("animal", ["getAnimals", "getMessage"])
  },
  methods: {
    fetchAnimals() {
      this.$store.dispatch(`animal/${FETCH_ANIMALS}`).then(
        () => {
          this.animals = this.getAnimals;
        },
        err => {
          this.$alert(`${err.message}`, "Erro", "error");
        }
      );
    },
    sort() {
      this.animals.sort(this.compareNames);
      this.sortType *= -1;
    },
    compareNames(u1, u2) {
      if (u1.name > u2.name) return 1 * this.sortType;
      else if (u1.name < u2.name) return -1 * this.sortType;
      else return 0;
    },

    viewAnimal(id) {
      const animal = this.animals.find(animal => animal._id === id);

      if (!animal)
        return this.$alert("Animal não encontrado.", "Erro", "error");
      const links = Array.isArray(animal.links) ? animal.links : [];
      const photo = links.find(
        link => link && link.url && (link.types === "photo" || !link.types)
      );
      this.$fire({
        title: animal.name,
        html: this.generateTemplate(animal),
        imageUrl: photo ? photo.url : undefined,
        imageWidth: 400,
        imageHeight: 200,
        imageAlt: "Imagem desconhecida"
      });
    },

    generateTemplate(animal) {
      let response = `
          <h4>Grupo: ${animal.group || "Não indicado"}</h4>
          <h5>(nível: ${
            animal.level == null ? "Não indicado" : animal.level
          })</h5>
          <p>${animal.description || ""}</p>
          <p>Elementos multimédia:
        `;
      for (const link of Array.isArray(animal.links) ? animal.links : []) {
        if (!link || !link.url) continue;
        response += ` <a href='${link.url}' target='_blank'>${link.types}</a>`;
      }
      response += `</p><p>Comentários: ${
        Array.isArray(animal.comments) ? animal.comments.length : 0
      } Avaliações: ${
        Array.isArray(animal.evaluation) ? animal.evaluation.length : 0
      }</p> `;
      return response;
    },
    removeAnimal(id) {
      this.$confirm(
        "Se sim, clique em OK",
        "Deseja mesmo remover o animal?",
        "warning",
        { confirmButtonText: "OK", cancelButtonText: "Cancelar" }
      ).then(
        () => {
          this.$store.dispatch(`animal/${REMOVE_ANIMAL}`, id).then(
            () => {
              this.$alert(this.getMessage, "Animal removido!", "success");
              this.fetchAnimals();
            },
            err => {
              this.$alert(`${err.message}`, "Erro", "error");
            }
          );
        },
        () => {
          this.$alert("Remoção cancelada!", "Informação", "info");
        }
      );
    }
  },
  created() {
    this.fetchAnimals();
  }
};
</script>
<style scoped>
.list-table-scroll {
  overflow-x: auto;
}
@media (min-width: 992px) {
  .list-table-scroll td:last-child {
    min-width: 22rem;
  }
}
</style>
