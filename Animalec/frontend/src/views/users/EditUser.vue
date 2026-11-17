<template>
  <section class="page-section">
     <b-container>
      <HeaderPage title="Editar Utilizador"/>
   
      <!--FORM-->
      <b-row>
        <b-col cols="2"></b-col>
        <b-col cols="8">
          <p v-if="loading" role="status">A carregar o registo...</p>
          <p v-else-if="loadError" class="alert alert-danger" role="alert">
            {{ loadError }}
          </p>
          <router-link
            v-if="loadError"
            :to="{ name: 'listUsers' }"
            class="btn btn-outline-info"
            >VOLTAR À LISTAGEM</router-link
          >
          <form v-if="user && !loading" @submit.prevent="update">
            <div class="form-group">
              <input
                v-model="user.name"
                type="text"
                class="form-control form-control-lg"
                id="txtName"
                placeholder="escreve nome"
                required
              />
            </div>
            <div class="form-group">
              <select id="sltType" class="form-control form-control-lg" v-model="user.type">
                <option value>-- SELECIONA TIPO --</option>
                <option value="admin">ADMINISTRADOR</option>
                <option value="user">UTILIZADOR NORMAL</option>
              </select>
            </div>
            <div class="form-group">
            <input
              v-model="user.birth_date"
              type="date"
              onmouseenter="(this.type='date')"
              onmouseleave="(this.type='text')"
              class="form-control form-control-lg"
              id="txtBirthDate"
              placeholder="escreve data de nascimento"
              required
            />
            </div>
            <div class="form-group">
              <textarea
                id="txtDescription"
                class="form-control form-control-lg"
                placeholder="escreve descrição"
                cols="30"
                rows="10"
                v-model="user.description"
                required
              ></textarea>
            </div>
            <div class="form-group">
              <input
                v-model="user.location.city"
                type="text"
                class="form-control form-control-lg"
                id="txtCity"
                placeholder="escreve cidade"
                required
              />
            </div>
            <div class="form-group">
              <input
                v-model="user.location.country"
                type="text"
                class="form-control form-control-lg"
                id="txtCountry"
                placeholder="escreve país"
                required
              />
            </div>
            <div class="form-group">
              <input
                v-model="user.gamification.points"
                type="text"
                min="0"
                onmouseenter="(this.type='number')"
                onmouseleave="(this.type='text')"
                class="form-control form-control-lg"
                id="txtPoints"
                placeholder="escreve pontos"
                
              />
            </div>
              <div class="form-group">
              <input
                v-model="user.gamification.quiz"
                type="text"
                min="0"
                onmouseenter="(this.type='number')"
                onmouseleave="(this.type='text')"
                class="form-control form-control-lg"
                id="txtCountry"
                placeholder="escreve último nível de quiz completo"
                
              />
            </div>
            
            <div class="form-group">
              <input
                v-model="user.auth.username"
                type="text"
                class="form-control form-control-lg"
                id="txtEmail"
                placeholder="escreve username"
                required
              />
            </div>
            <div class="form-group">
              <input
                v-model="user.auth.password"
                type="password"
                class="form-control form-control-lg"
                id="txtPassword"
                placeholder="escreve password"
                required
              />
            </div>
            <div class="form-group">
              <input
                v-model="user.auth.password"
                type="password"
                class="form-control form-control-lg"
                id="txtConfirmPassword"
                placeholder="confirma password"
              />
            </div>
            <button type="submit" class="btn btn-outline-success btn-lg mr-2">
              <i class="fas fa-edit"></i> ATUALIZAR</button>
            <router-link
              :to="{name: 'listUsers'}"
              tag="button"
              class="btn btn-outline-danger btn-lg"
            ><i class="fas fa-window-close"></i> CANCELAR</router-link>
          </form>
        </b-col>
        <b-col cols="2"></b-col>
      </b-row>
     </b-container>
  </section>
</template>

<script>
import { EDIT_USER, FETCH_USERS } from "@/store/users/user.constants";
import HeaderPage from "@/components/HeaderPage.vue"
import router from "@/router";
import { mapGetters } from "vuex";

export default {
  name: "EditUser",
  components: {
    HeaderPage
  },
  data: () => {
    return {
      user: null,
      loading: true,
      loadError: ""
    };
  },
  computed: {
    ...mapGetters("user", ["getUsersById", "getMessage"])
  },
  methods: {
    update() {
      this.$store.dispatch(`user/${EDIT_USER}`, this.$data.user).then(
        () => {
          this.$alert(
            this.getMessage,
            "Utilizador atualizado!",
            "success"
          );
          router.push({name: 'listUsers'});
        },
        err => {
          this.$alert(`${err.message}`, "Erro", "error");
        }
      );
    }
  },
  async created() {
    try {
      let record = this.getUsersById(this.$route.params.userId);
      if (!record) {
        await this.$store.dispatch(`user/${FETCH_USERS}`);
        record = this.getUsersById(this.$route.params.userId);
      }
      if (!record) throw new Error("Utilizador: registo não encontrado.");
      this.user = JSON.parse(JSON.stringify(record));
      this.user.location = Object.assign(
        { city: "", district: "", country: "" },
        this.user.location
      );
      this.user.auth = Object.assign(
        { username: "", password: "" },
        this.user.auth
      );
      this.user.gamification = Object.assign(
        { points: 0, quiz: 0 },
        this.user.gamification
      );
      this.user.birth_date =
        typeof this.user.birth_date === "string"
          ? this.user.birth_date.slice(0, 10)
          : "";
    } catch (error) {
      this.user = null;
      this.loadError = error.message || "Não foi possível carregar o registo.";
    } finally {
      this.loading = false;
    }
  }
};
</script>
