package com.snortids.app.data

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor

interface SnortApiService {
    @GET("api/alerts")
    suspend fun getAlerts(
        @Query("search") search: String? = null,
        @Query("protocol") protocol: String? = null,
        @Query("priority") priority: Int? = null,
        @Query("sortField") sortField: String? = null,
        @Query("sortDir") sortDir: String? = null
    ): List<SnortAlert>

    @GET("api/alerts/stats")
    suspend fun getStats(): AlertStats

    @GET("api/alerts/{id}")
    suspend fun getAlertById(@Path("id") id: String): SnortAlert

    @GET("api/health")
    suspend fun health(): Map<String, Any>
}

object ApiClient {
    private const val DEFAULT_BASE_URL = "http://10.0.2.2:3001/"

    private val logging = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    private val client = OkHttpClient.Builder()
        .addInterceptor(logging)
        .build()

    private var baseUrl: String = DEFAULT_BASE_URL

    private val retrofit: Retrofit by lazy {
        Retrofit.Builder()
            .baseUrl(baseUrl)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    val service: SnortApiService by lazy {
        retrofit.create(SnortApiService::class.java)
    }

    fun setBaseUrl(url: String) {
        baseUrl = if (url.endsWith("/")) url else "$url/"
    }
}
