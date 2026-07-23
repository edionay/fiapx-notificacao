export interface Email {
  para: string;
  assunto: string;
  corpo: string;
}

export interface EnviadorEmail {
  enviar(email: Email): Promise<void>;
}
